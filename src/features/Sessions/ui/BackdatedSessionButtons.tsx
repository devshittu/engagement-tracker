// src/features/Sessions/ui/BackdatedSessionButtons.tsx
'use client';

import { useState } from 'react';
import { BackdatedOneToOneSessionModal } from './BackdatedOneToOneSessionModal';
import { BackdatedGroupSessionModal } from './BackdatedGroupSessionModal';

export const BackdatedSessionButtons = () => {
  const [isOneToOneModalOpen, setIsOneToOneModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  return (
    <>
      <div className="flex space-x-2">
        <button
          onClick={() => setIsOneToOneModalOpen(true)}
          className="bg-teal-500 text-white px-4 py-2 rounded-md shadow hover:bg-teal-600 transition"
        >
          Create Backdated One-to-One Session
        </button>
        <button
          onClick={() => setIsGroupModalOpen(true)}
          className="bg-teal-500 text-white px-4 py-2 rounded-md shadow hover:bg-teal-600 transition"
        >
          Create Backdated Group Session
        </button>
      </div>

      <BackdatedOneToOneSessionModal
        isOpen={isOneToOneModalOpen}
        setIsOpen={setIsOneToOneModalOpen}
      />
      <BackdatedGroupSessionModal
        isOpen={isGroupModalOpen}
        setIsOpen={setIsGroupModalOpen}
      />
    </>
  );
};
// src/features/Sessions/ui/BackdatedSessionButtons.tsx
