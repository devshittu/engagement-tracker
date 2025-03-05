'use client';

import React, { useCallback, useMemo } from 'react';
import { InView } from 'react-intersection-observer';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useActiveSessionsInfinite } from '@/features/Sessions/hooks/useActiveSessionsInfinite';

import Link from 'next/link';
import { Session } from '@/types/serviceUser';
import ElapsedTime from './ElapsedTime';

const ActiveSessionsInfiniteClient: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useActiveSessionsInfinite({ sortBy: 'timeIn', order: 'asc' });

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to end session');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Session ended successfully!');
      queryClient.invalidateQueries({ queryKey: ['activeSessionsInfinite'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to end session');
    },
  });

  // Flatten pages into a single array, if needed (for a full list view).
  const allSessions: Session[] = useMemo(
    // @ts-ignore
    () => data?.pages.flatMap((page) => page.sessions) || [],
    [data],
  );

  if (isLoading)
    return <p className="text-center">Loading active sessions...</p>;
  if (isError)
    return <p className="text-center text-error">Error: {error?.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Active Sessions</h1>
        <div className="flex items-center space-x-4">
          <div className="badge badge-lg">
            {/* @ts-ignore */}
            Total Active: {data?.pages[0]?.total || 0}
          </div>
          {/* <Link href="/sessions/active" className="btn btn-primary">
            View All
          </Link> */}
        </div>
      </div>

      <div className="space-y-4">
        {/* @ts-ignore */}
        {data?.pages.map((page, pageIndex) => (
          <React.Fragment key={pageIndex}>
            {page.sessions.map((session: Session) => (
              <div key={session.id} className="card bg-base-100 shadow-md p-4">
                <div className="card-body">
                  <h2 className="card-title text-xl">
                    {session.admission.serviceUser.name}
                  </h2>
                  <p className="text-sm">
                    <strong>Activity:</strong> {session.activity.name}
                  </p>
                  <p className="text-sm">
                    <strong>Ward:</strong> {session.admission.ward.name}
                  </p>
                  <p className="text-sm">
                    <strong>Time In:</strong>{' '}
                    {new Date(session.timeIn).toLocaleString()}
                  </p>
                  <div className="my-4">
                    <ElapsedTime
                      timeIn={session.timeIn}
                      timeOut={session.timeOut}
                      big
                    />
                  </div>
                  <div className="card-actions justify-end">
                    <button
                      onClick={() => endSessionMutation.mutate(session.id)}
                      className="btn btn-error"
                    >
                      End Session
                    </button>
                  </div>
                </div>
              </div>
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
                <div className="loading loading-spinner loading-lg"></div>
              ) : (
                <button className="btn btn-outline">Load more</button>
              )}
            </div>
          )}
        </InView>
      )}

      {!hasNextPage && !isLoading && (
        <div className="py-4 text-center">
          <p>No more sessions to load.</p>
        </div>
      )}
    </div>
  );
};

export default ActiveSessionsInfiniteClient;
// src/features/Sessions/ui/ActiveSessionsInfiniteClient.tsx
