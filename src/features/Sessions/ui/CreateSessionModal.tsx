// 'use client';

// import React, { useState } from 'react';
// import Modal from '@/components/Modal/Modal';
// import { Activity, Admission } from '@/types/serviceUser';
// import SessionForm from '@/app/sessions/new/SessionForm';
// // import { Admission, Activity } from '@/types/sessionFormTypes'; // Adjust import paths

// // Props for this wrapper
// type CreateSessionModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
//   preselectedUserId?: number;
//   admissions?: Admission[];
//   activities: Activity[];
//   onSessionCreated?: () => void; // callback after session is created
// };

// const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
//   isOpen,
//   onClose,
//   preselectedUserId,
//   admissions,
//   activities,
//   onSessionCreated,
// }) => {
//   return (
//     <Modal
//       show={isOpen}
//       handleClose={onClose}
//       ariaLabel="Create Session"
//       id="create-session-modal"
//     >
//       <div className="p-4 flex justify-between items-center bg-base-200">
//         <h3 className="text-xl font-bold">Create Session</h3>
//         {/* A close button in the header */}
//         <button className="btn btn-sm btn-ghost text-xl" onClick={onClose}>
//           ✕
//         </button>
//       </div>
//       <div className="p-4">
//         <SessionForm
//           preselectedUserId={preselectedUserId}
//           admissions={admissions}
//           activities={activities}
//           onSessionCreated={onSessionCreated}
//           onClose={onClose}
//         />
//       </div>
//     </Modal>
//   );
// };

// export default CreateSessionModal;
'use client';

import React from 'react';
import Modal from '@/components/Modal/Modal';
import SessionForm from '@/features/Sessions/ui/SessionForm';

type Admission = {
  id: number;
  serviceUser: { id: number; name: string };
};

type Activity = {
  id: number;
  name: string;
};

type CreateSessionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  preselectedUserId?: number;
  admissions: Admission[];
  activities: Activity[];
  onSessionCreated?: () => void;
};

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  preselectedUserId,
  admissions,
  activities,
  onSessionCreated,
}) => {
  return (
    <Modal show={isOpen} handleClose={onClose} ariaLabel="Create Session">
      {/* Modal Header */}
      <div className="p-4 flex justify-between items-center bg-base-200">
        <h3 className="text-xl font-bold">Create Session</h3>
        <button className="btn btn-sm btn-ghost text-xl" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-4">
        <SessionForm
          preselectedUserId={preselectedUserId}
          admissions={admissions}
          activities={activities}
          onSessionCreated={onSessionCreated}
          onClose={onClose}
        />
      </div>
    </Modal>
  );
};

export default CreateSessionModal;
