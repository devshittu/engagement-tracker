// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { InView } from 'react-intersection-observer';
// import { toast } from 'react-toastify';
// import { useQueryClient } from '@tanstack/react-query';
// import {
//   Session,
//   SessionsResponse,
//   GroupedResponse,
//   GroupedSession,
// } from '@/types/serviceUser';
// import { useSessions } from '@/hooks/useSessions';
// import ElapsedTime from '@/features/Sessions/ui/ElapsedTime';

// // Define SessionsData type
// type SessionsData = SessionsResponse | GroupedResponse;

// const InfiniteSessionsList: React.FC = () => {
//   const [sortBy, setSortBy] = useState<string>('timeIn');
//   const [order, setOrder] = useState<'asc' | 'desc'>('desc');
//   const [groupBy, setGroupBy] = useState<
//     'none' | 'timeIn' | 'activityId' | 'admissionId'
//   >('none');

//   const router = useRouter();
//   const queryClient = useQueryClient();

//   const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
//     useSessions({
//       sortBy,
//       order,
//       groupBy,
//     });

//   // Handle session end
//   const handleEndSession = async (sessionId: number) => {
//     try {
//       const response = await fetch(`/api/sessions/${sessionId}/end`, {
//         method: 'POST',
//       });

//       if (response.ok) {
//         queryClient.invalidateQueries({ queryKey: ['sessions'] });
//         toast.success('Session ended successfully!');
//       } else {
//         const errorData = await response.json();
//         toast.error(errorData.error || 'Failed to end session');
//       }
//     } catch (error) {
//       console.error('Error ending session:', error);
//       toast.error('An unexpected error occurred.');
//     }
//   };

//   // Function to render pages
//   const renderPage = (page: SessionsData, pageIndex: number) => {
//     if ('groupedData' in page) {
//       // Grouped sessions
//       return (
//         <React.Fragment key={pageIndex}>
//           {page.groupedData.map((group: GroupedSession, idx) => (
//             <div
//               key={idx}
//               className="card bg-base-100 shadow-xl border border-base-300 p-4"
//             >
//               <div className="card-body">
//                 {group.timeIn && (
//                   <p className="text-lg font-semibold">
//                     ⏳ timeIn: {group.timeIn}
//                   </p>
//                 )}
//                 {group.admissionId && <p>🏥 Admission: {group.admissionId}</p>}
//                 {group.activityId && <p>🎯 Activity: {group.activityId}</p>}
//                 <p className="text-primary font-bold">
//                   📌 Count: {group._count._all}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </React.Fragment>
//       );
//     } else {
//       // Normal session list
//       return (
//         <React.Fragment key={pageIndex}>
//           {page.sessions.map((session: Session) => (
//             <div
//               key={session.id}
//               className="card bg-base-100 shadow-xl border border-base-300 p-4 mb-4"
//             >
//               <div className="card-body">
//                 <h2 className="card-title flex justify-between items-center">
//                   <span>🧑‍⚕️ {session.admission.serviceUser.name}</span>
//                   <span className="badge badge-primary text-sm">
//                     #{session.id}
//                   </span>
//                 </h2>
//                 <p className="text-secondary">
//                   🎯 Activity: {session.activity.name}
//                 </p>
//                 <p>⏳ Time In: {new Date(session.timeIn).toLocaleString()}</p>
//                 <p>
//                   🚀 Time Out:{' '}
//                   {session.timeOut ? (
//                     new Date(session.timeOut).toLocaleString()
//                   ) : (
//                     <span className="badge badge-warning">In Progress</span>
//                   )}
//                 </p>
//                 <div>
//                   ⏰ Elapsed Time:{' '}
//                   <ElapsedTime
//                     timeIn={session.timeIn}
//                     timeOut={session.timeOut}
//                     big
//                   />
//                 </div>

//                 {/* End session button */}
//                 {!session.timeOut && (
//                   <button
//                     onClick={() => handleEndSession(session.id)}
//                     className="btn btn-error text-white w-full mt-3"
//                   >
//                     End Session
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </React.Fragment>
//       );
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       {/* Filters Section */}
//       <div className="flex flex-wrap items-center gap-4 mb-6">
//         <label htmlFor="sortSelect" className="font-semibold">
//           Sort By:
//         </label>
//         <select
//           id="sortSelect"
//           className="select select-bordered"
//           value={sortBy}
//           onChange={(e) => setSortBy(e.target.value)}
//         >
//           <option value="timeIn">timeIn</option>
//           <option value="activityName">activityName</option>
//           <option value="serviceUserName">serviceUserName</option>
//         </select>

//         <label htmlFor="orderSelect" className="font-semibold">
//           Order:
//         </label>
//         <select
//           id="orderSelect"
//           className="select select-bordered"
//           value={order}
//           onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
//         >
//           <option value="asc">asc</option>
//           <option value="desc">desc</option>
//         </select>

//         <label htmlFor="groupSelect" className="font-semibold">
//           Group By:
//         </label>
//         <select
//           id="groupSelect"
//           className="select select-bordered"
//           value={groupBy}
//           onChange={(e) =>
//             setGroupBy(
//               e.target.value as
//                 | 'none'
//                 | 'timeIn'
//                 | 'activityId'
//                 | 'admissionId',
//             )
//           }
//         >
//           <option value="none">None</option>
//           <option value="timeIn">timeIn</option>
//           <option value="activityId">activityId</option>
//           <option value="admissionId">admissionId</option>
//         </select>
//       </div>

//       {/* Sessions List */}
//       <div className="overflow-y-auto max-h-[calc(100vh-180px)]">
//         {/*  @ts-ignore */}
//         {data?.pages.map((page: SessionsData, pageIndex: number) =>
//           renderPage(page, pageIndex),
//         )}

//         {hasNextPage && (
//           <InView
//             onChange={(inView) => {
//               if (inView && !isFetchingNextPage) {
//                 fetchNextPage();
//               }
//             }}
//           >
//             {({ ref }) => (
//               <div ref={ref} className="flex justify-center items-center p-4">
//                 {isFetchingNextPage ? (
//                   <span className="loading loading-spinner text-primary"></span>
//                 ) : (
//                   <button
//                     className="btn btn-outline"
//                     onClick={() => fetchNextPage()}
//                   >
//                     Load more
//                   </button>
//                 )}
//               </div>
//             )}
//           </InView>
//         )}

//         {!hasNextPage && !isFetching && (
//           <div className="text-center p-4 text-gray-500">
//             <p>No more sessions to load.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default InfiniteSessionsList;

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InView } from 'react-intersection-observer';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import {
  Session,
  SessionsResponse,
  GroupedResponse,
  GroupedSession,
} from '@/types/serviceUser';
import { useSessions } from '@/hooks/useSessions';
import ElapsedTime from '@/features/Sessions/ui/ElapsedTime';
import GroupSessionCard from '@/features/Sessions/ui/GroupSessionCard';
import { motion } from 'framer-motion';

type SessionsData = SessionsResponse | GroupedResponse;

const InfiniteSessionsList: React.FC = () => {
  const [sortBy, setSortBy] = useState<string>('timeIn');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [groupBy, setGroupBy] = useState<
    'none' | 'timeIn' | 'activityId' | 'admissionId'
  >('none');

  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useSessions({
      sortBy,
      order,
      groupBy,
    });

  const handleEndSession = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
        toast.success('Session ended successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to end session');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('An unexpected error occurred.');
    }
  };

  const renderPage = (page: SessionsData, pageIndex: number) => {
    if ('groupedData' in page) {
      return (
        <React.Fragment key={pageIndex}>
          {page.groupedData.map((group: GroupedSession, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="card-body">
                {group.timeIn && (
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    ⏳ timeIn: {group.timeIn}
                  </p>
                )}
                {group.admissionId && (
                  <p className="text-gray-600 dark:text-gray-400">
                    🏥 Admission: {group.admissionId}
                  </p>
                )}
                {group.activityId && (
                  <p className="text-gray-600 dark:text-gray-400">
                    🎯 Activity: {group.activityId}
                  </p>
                )}
                <p className="text-teal-500 font-bold">
                  📌 Count: {group._count._all}
                </p>
              </div>
            </motion.div>
          ))}
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment key={pageIndex}>
          {page.sessions
            .reduce(
              (
                acc: { groupRef: string; sessions: Session[] }[],
                session: Session,
              ) => {
                if (
                  session.type === 'GROUP' &&
                  session.groupRef &&
                  !session.timeOut
                ) {
                  const existingGroup = acc.find(
                    (group) => group.groupRef === session.groupRef,
                  );
                  if (existingGroup) {
                    existingGroup.sessions.push(session);
                  } else {
                    acc.push({
                      groupRef: session.groupRef,
                      sessions: [session],
                    });
                  }
                }
                return acc;
              },
              [],
            )
            .map((group) => (
              <GroupSessionCard
                key={group.groupRef}
                groupRef={group.groupRef}
                groupDescription={group.sessions[0].groupDescription || ''}
                sessions={group.sessions}
              />
            ))}
          {page.sessions
            .filter(
              (session: Session) =>
                session.type === 'ONE_TO_ONE' || session.timeOut,
            )
            .map((session: Session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="card bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-4 mb-4"
              >
                <div className="card-body">
                  <h2 className="card-title flex justify-between items-center text-gray-900 dark:text-gray-100">
                    <span>🧑‍⚕️ {session.admission.serviceUser.name}</span>
                    <span className="badge badge-primary bg-teal-500 text-white text-sm">
                      #{session.id}
                    </span>
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    🎯 Activity: {session.activityLog.activity.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    ⏳ Time In: {new Date(session.timeIn).toLocaleString()}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    🚀 Time Out:{' '}
                    {session.timeOut ? (
                      new Date(session.timeOut).toLocaleString()
                    ) : (
                      <span className="badge badge-warning bg-yellow-500 text-white">
                        In Progress
                      </span>
                    )}
                  </p>
                  <div className="text-gray-600 dark:text-gray-400">
                    ⏰ Elapsed Time:{' '}
                    <ElapsedTime
                      timeIn={session.timeIn}
                      timeOut={session.timeOut}
                      big
                    />
                  </div>

                  {!session.timeOut && session.type === 'ONE_TO_ONE' && (
                    <button
                      onClick={() => handleEndSession(session.id)}
                      className="btn bg-red-500 hover:bg-red-600 text-white w-full mt-3"
                    >
                      End Session
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
        </React.Fragment>
      );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <label
          htmlFor="sortSelect"
          className="font-semibold text-gray-900 dark:text-gray-100"
        >
          Sort By:
        </label>
        <select
          id="sortSelect"
          className="select select-bordered bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="timeIn">timeIn</option>
          <option value="activityName">activityName</option>
          <option value="serviceUserName">serviceUserName</option>
        </select>

        <label
          htmlFor="orderSelect"
          className="font-semibold text-gray-900 dark:text-gray-100"
        >
          Order:
        </label>
        <select
          id="orderSelect"
          className="select select-bordered bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          value={order}
          onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
        >
          <option value="asc">asc</option>
          <option value="desc">desc</option>
        </select>

        <label
          htmlFor="groupSelect"
          className="font-semibold text-gray-900 dark:text-gray-100"
        >
          Group By:
        </label>
        <select
          id="groupSelect"
          className="select select-bordered bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          value={groupBy}
          onChange={(e) =>
            setGroupBy(
              e.target.value as
                | 'none'
                | 'timeIn'
                | 'activityId'
                | 'admissionId',
            )
          }
        >
          <option value="none">None</option>
          <option value="timeIn">timeIn</option>
          <option value="activityId">activityId</option>
          <option value="admissionId">admissionId</option>
        </select>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-180px)]">
        {data?.pages.map((page: SessionsData, pageIndex: number) =>
          renderPage(page, pageIndex),
        )}

        {hasNextPage && (
          <InView
            onChange={(inView) => {
              if (inView && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
          >
            {({ ref }) => (
              <div ref={ref} className="flex justify-center items-center p-4">
                {isFetchingNextPage ? (
                  <span className="loading loading-spinner text-teal-500"></span>
                ) : (
                  <button
                    className="btn btn-outline hover:bg-teal-500 hover:text-white"
                    onClick={() => fetchNextPage()}
                  >
                    Load more
                  </button>
                )}
              </div>
            )}
          </InView>
        )}

        {!hasNextPage && !isFetching && (
          <div className="text-center p-4 text-gray-500 dark:text-gray-400">
            <p>No more sessions to load.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfiniteSessionsList;
// src/app/sessions/InfiniteSessionsList.tsx
