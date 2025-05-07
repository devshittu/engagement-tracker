// src/features/Sessions/ui/EditSessionTimesModal.tsx
'use client';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { motion } from 'framer-motion';
import { TimePickerWidget } from './TimePickerWidget';
import { useUpdateSessionTimes } from '../hooks/useUpdateSessionTimes';
import { Session } from '@prisma/client';

interface EditSessionTimesModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  session: Session;
}

export const EditSessionTimesModal = ({
  isOpen,
  setIsOpen,
  session,
}: EditSessionTimesModalProps) => {
  const { mutate: updateSessionTimes, isPending } = useUpdateSessionTimes();
  const [timeIn, setTimeIn] = useState<Date | null>(new Date(session.timeIn));
  const [timeOut, setTimeOut] = useState<Date | null>(session.timeOut ? new Date(session.timeOut) : null);

  const handleSubmit = () => {
    if (!timeIn || !timeOut) {
      alert('Please set both start and end times.');
      return;
    }

    updateSessionTimes(
      {
        id: session.id,
        timeIn: timeIn.toISOString(),
        timeOut: timeOut.toISOString(),
      },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
      },
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl transform overflow-hidden rounded-xl bg-white p-6 text-left transition-all">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center p-4">
                    <Dialog.Title as="h2" className="text-2xl font-bold text-gray-900">
                      Edit Session Times
                    </Dialog.Title>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                      aria-label="Close modal"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="form-control">
                      <label htmlFor="timeIn" className="label-text font-medium text-gray-900">
                        Start Time
                      </label>
                      <TimePickerWidget selected={timeIn} onChange={(date) => setTimeIn(date)} />
                    </div>
                    <div className="form-control">
                      <label htmlFor="timeOut" className="label-text font-medium text-gray-900">
                        End Time
                      </label>
                      <TimePickerWidget selected={timeOut} onChange={(date) => setTimeOut(date)} />
                    </div>
                    <div className="form-control">
                      <button
                        id="submitButton"
                        onClick={handleSubmit}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-lg py-2 transition-all duration-300 disabled:opacity-50"
                        disabled={isPending}
                      >
                        {isPending ? 'Updating...' : 'Update Times'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
// src/features/Sessions/ui/EditSessionTimesModal.tsx
