// src/features/ServiceUsers/ui/SearchServiceUsers.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { InView } from 'react-intersection-observer';
import { useDebounce } from '@/hooks/useDebounce';
import { ServiceUser } from '@/types/serviceUser';
import { useSearchServiceUsers } from '@/features/Search/hooks/useSearchServiceUsers';
import { apiClient } from '@/lib/api-client';
import CreateSessionModal from '@/features/Sessions/ui/CreateSessionModal';
import GroupSessionModal from '@/features/Sessions/ui/GroupSessionModal';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

type Admission = {
  id: number;
  serviceUser: { id: number; name: string };
};

type ActivityLog = {
  id: number;
  name: string;
  startDate: string;
  duration?: number;
};

const SearchServiceUsers: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [includeDischarged, setIncludeDischarged] = useState<boolean>(false);
  const debouncedQuery = useDebounce<string>(query, 500);

  const [showOneToOneModal, setShowOneToOneModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [preselectedUserId, setPreselectedUserId] = useState<
    number | undefined
  >(undefined);

  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [admRes, actRes] = await Promise.all([
          apiClient.get<Admission[]>('/api/admissions/active'),
          apiClient.get<ActivityLog[]>('/api/activities/active'),
        ]);
        setAdmissions(admRes || []);
        setActivities(actRes || []);
      } catch (error) {
        console.error('Failed to load admissions or activities:', error);
      }
    };
    loadData();
  }, []);

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
    includeDischarged,
  });

  const handleCreateOneToOneClick = (userId: number) => {
    setPreselectedUserId(userId);
    setShowOneToOneModal(true);
  };

  const handleCreateGroupClick = () => {
    setShowGroupModal(true);
  };

  return (
    <div className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-xl mb-6 border border-gray-200 dark:border-gray-700 rounded-xl"
      >
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Search Service Users
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="form-control flex-1">
              <input
                type="text"
                placeholder="Search by name or NHS number..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-teal-500 transition-all duration-300 rounded-lg"
              />
            </div>
            <div className="flex items-center space-x-3 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg">
              <label
                htmlFor="discharged-toggle"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Include Discharged
              </label>
              <div className="relative inline-block w-10 h-6">
                <input
                  type="checkbox"
                  id="discharged-toggle"
                  checked={includeDischarged}
                  onChange={(e) => setIncludeDischarged(e.target.checked)}
                  className="peer sr-only"
                />
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    includeDischarged
                      ? 'bg-teal-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                    includeDischarged ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleCreateOneToOneClick}
              className="btn bg-teal-500 hover:bg-teal-600 text-white transform hover:scale-105 transition-all duration-300 rounded-lg px-6 py-2"
            >
              Create One-to-One Session
            </button>
            <button
              onClick={handleCreateGroupClick}
              className="btn bg-green-500 hover:bg-green-600 text-white transform hover:scale-105 transition-all duration-300 rounded-lg px-6 py-2"
            >
              Start a Group Session
            </button>
          </div>
        </div>
      </motion.div>

      {isLoading && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Loading service users...
        </p>
      )}
      {isError && (
        <p className="text-center text-red-500">Error: {error?.message}</p>
      )}

      <div className="space-y-4">
        {data?.pages.map((page, pageIndex: number) => (
          <React.Fragment key={pageIndex}>
            {Array.isArray(page.serviceUsers) &&
              page.serviceUsers.map((user: ServiceUser) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="card-title text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          NHS: {user.nhsNumber}
                        </p>
                        {user.admissions.length > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Ward: {user.admissions[0].ward.name} | Status:{' '}
                            {user.admissions[0].dischargeDate
                              ? 'Discharged'
                              : 'Admitted'}
                          </p>
                        )}
                      </div>
                      <button
                        className="btn bg-teal-500 hover:bg-teal-600 text-white transform hover:scale-105 transition-all duration-300 rounded-lg"
                        onClick={() => handleCreateOneToOneClick(user.id)}
                      >
                        Create Session
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </React.Fragment>
        ))}
      </div>

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
                <div className="loading loading-spinner loading-lg text-teal-500" />
              ) : (
                <button className="btn btn-outline hover:bg-teal-500 hover:text-white rounded-lg transition-all duration-300">
                  Load more
                </button>
              )}
            </div>
          )}
        </InView>
      )}

      {!hasNextPage && !isLoading && (
        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
          <p>No more service users to load.</p>
        </div>
      )}

      <CreateSessionModal
        isOpen={showOneToOneModal}
        onClose={() => setShowOneToOneModal(false)}
        preselectedUserId={preselectedUserId}
        admissions={admissions}
        activities={activities}
        onSessionCreated={() => {
          setShowOneToOneModal(false);
          queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
        }}
      />
      <GroupSessionModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        admissions={admissions}
        activities={activities}
        onSessionCreated={() => {
          setShowGroupModal(false);
          queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
        }}
      />
    </div>
  );
};

export default SearchServiceUsers;
// src/features/ServiceUsers/ui/SearchServiceUsers.tsx
