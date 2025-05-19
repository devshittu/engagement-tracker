// src/features/Sessions/ui/dashboard/components/OneToOneSessionCard.tsx
// 'use client';

// import React from 'react';
// import { motion } from 'framer-motion';
// import { Session } from '@/types/serviceUser';
// import ElapsedTime from '@/features/Sessions/ui/ElapsedTime';

// type OneToOneSessionCardProps = {
//   session: Session;
//   onDecline: (event: React.MouseEvent) => void;
//   onEndSession: (event: React.MouseEvent) => void;
// };

// const OneToOneSessionCard: React.FC<OneToOneSessionCardProps> = ({
//   session,
//   onDecline,
//   onEndSession,
// }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.3 }}
//     className="card bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
//   >
//     <div className="card-body">
//       <h2 className="card-title text-xl text-gray-900 dark:text-gray-100">
//         {session.admission.serviceUser.name}
//       </h2>
//       <p className="text-sm text-gray-600 dark:text-gray-400">
//         <strong>Activity:</strong> {session.activityLog.activity.name}
//       </p>
//       <p className="text-sm text-gray-600 dark:text-gray-400">
//         <strong>Ward:</strong> {session.admission.ward.name}
//       </p>
//       <p className="text-sm text-gray-600 dark:text-gray-400">
//         <strong>Time In:</strong> {new Date(session.timeIn).toLocaleString()}
//       </p>
//       <div className="my-4">
//         <ElapsedTime timeIn={session.timeIn} timeOut={session.timeOut} big />
//       </div>
//       {!session.timeOut && (
//         <div className="card-actions justify-between space-x-2">
//           <button
//             onClick={onDecline}
//             className="btn bg-yellow-500 hover:bg-yellow-600 text-white"
//           >
//             Decline
//           </button>
//           <button
//             onClick={onEndSession}
//             className="btn bg-red-500 hover:bg-red-600 text-white"
//           >
//             End Session
//           </button>
//         </div>
//       )}
//     </div>
//   </motion.div>
// );

// export default OneToOneSessionCard;

'use client';

import React from 'react';
import { Session, SessionStatus } from '@prisma/client';

interface OneToOneSessionCardProps {
  session: Session & {
    admission: { serviceUser: { name: string } };
    activityLog: { activity: { name: string } };
  };
  onDecline: (event: React.MouseEvent) => void;
  onEndSession: (event: React.MouseEvent) => void;
  onEditSession: (event: React.MouseEvent) => void;
}

const OneToOneSessionCard: React.FC<OneToOneSessionCardProps> = ({
  session,
  onDecline,
  onEndSession,
  onEditSession,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            <span className="mr-2">🧑‍⚕️</span>
            {session.admission.serviceUser.name}
          </h2>
          <span className="badge bg-teal-500 text-white px-2 py-1 rounded-full text-sm">
            #{session.id}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="mr-2">🎯</span>Activity:{' '}
          {session.activityLog.activity.name}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="mr-2">⏳</span>Time In:{' '}
          {new Date(session.timeIn).toLocaleString()}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="mr-2">🚀</span>Time Out:{' '}
          {session.timeOut ? (
            new Date(session.timeOut).toLocaleString()
          ) : (
            <span className="badge bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
              In Progress
            </span>
          )}
        </p>
        <div className="flex space-x-2">
          {session.status === SessionStatus.ONGOING && (
            <>
              <button
                onClick={onDecline}
                className="btn bg-gray-500 hover:bg-gray-600 text-white rounded-lg py-2 px-4 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={onEndSession}
                className="btn bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 px-4 transition-colors"
              >
                End Session
              </button>
            </>
          )}
          {session.status === SessionStatus.COMPLETED && (
            <button
              onClick={onEditSession}
              className="btn bg-teal-500 hover:bg-teal-600 text-white rounded-lg py-2 px-4 transition-colors"
            >
              Edit Times
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OneToOneSessionCard;
// src/features/Sessions/ui/dashboard/components/OneToOneSessionCard.tsx
