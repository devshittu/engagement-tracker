'use client';

import React, { useState, useEffect } from 'react';
import { InView } from 'react-intersection-observer';
import { useDebounce } from '@/hooks/useDebounce';
import { ServiceUser } from '@/types/serviceUser';
import { useSearchServiceUsers } from '../hooks/useSearchServiceUsers';
import axios from 'axios';
import CreateSessionModal from '@/features/Sessions/ui/modals/CreateSessionModal';

type Admission = {
  id: number;
  serviceUser: { id: number; name: string };
};

type Activity = {
  id: number;
  name: string;
};

const SearchServiceUsers: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const debouncedQuery = useDebounce<string>(query, 500);

  const [showModal, setShowModal] = useState(false);
  const [preselectedUserId, setPreselectedUserId] = useState<
    number | undefined
  >(undefined);

  // These arrays must be fetched from the server for your session form
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // 1) Load active admissions + activities on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [admRes, actRes] = await Promise.all([
          axios.get<Admission[]>('/api/admissions/active'),
          axios.get<Activity[]>('/api/activities'),
        ]);
        setAdmissions(admRes.data);
        setActivities(actRes.data);
      } catch (error) {
        console.error('Failed to load admissions or activities:', error);
      }
    }
    loadData();
  }, []);

  // 2) Your existing infinite search
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useSearchServiceUsers({
    q: debouncedQuery,
    sortBy: 'name',
    order: 'asc',
  });

  // 3) Open the modal with a preselected user
  const handleCreateSessionClick = (userId: number) => {
    setPreselectedUserId(userId);
    setShowModal(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Search Service Users</h2>
          <div className="form-control">
            <input
              type="text"
              placeholder="Type a name or NHS number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && <p className="text-center">Loading service users...</p>}
      {isError && (
        <p className="text-center text-error">Error: {error?.message}</p>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {/* @ts-ignore */}
        {data?.pages.map((page, pageIndex: number) => (
          <React.Fragment key={pageIndex}>
            {page.serviceUsers.map((user: ServiceUser) => (
              <div
                key={user.id}
                className="card bg-base-100 shadow-md py-3 sm:py-4"
              >
                <div className="card-body">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="card-title">{user.name}</h3>
                      <p className="text-sm">NHS: {user.nhsNumber}</p>
                    </div>
                    <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleCreateSessionClick(user.id)}
                      >
                        Create Session
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Infinite Scrolling */}
      {hasNextPage && (
        <InView
          onChange={(inView) => {
            if (inView && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
        >
          {({ ref }) => (
            <div ref={ref} className="py-4 flex justify-center">
              {isFetchingNextPage ? (
                <div className="loading loading-spinner loading-lg" />
              ) : (
                <button className="btn btn-outline">Load more</button>
              )}
            </div>
          )}
        </InView>
      )}

      {/* No more results */}
      {!hasNextPage && !isLoading && (
        <div className="py-4 text-center">
          <p>No more service users to load.</p>
        </div>
      )}

      {/* CreateSessionModal with preselectedUserId */}
      <CreateSessionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        preselectedUserId={preselectedUserId}
        admissions={admissions}
        activities={activities}
        onSessionCreated={() => {
          // E.g., refresh active sessions if needed
          // toast or anything else
        }}
      />
    </div>
  );
};

export default SearchServiceUsers;
// src/features/Search/ui/SearchServiceUsers.tsx
