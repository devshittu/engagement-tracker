// src/components/ui/modals/ConfirmationDialog.tsx
'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { logger } from '@/lib/logger';

type ConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  icon?: React.ReactNode; // Optional SVG or icon component
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isPending = false,
  icon,
}) => {
  const handleConfirm = () => {
    logger.info('Confirmation dialog confirmed', { title });
    onConfirm();
  };

  const handleClose = () => {
    logger.info('Confirmation dialog closed', { title });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {icon && <div className="mb-4 flex justify-center">{icon}</div>}
                  <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
                    {title}
                  </Dialog.Title>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">{message}</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={handleClose}
                      className="btn bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-200 rounded-lg px-4 py-2"
                      disabled={isPending}
                    >
                      {cancelText}
                    </button>
                    <button
                      onClick={handleConfirm}
                      className={`btn bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 ${isPending ? 'btn-disabled' : ''}`}
                      disabled={isPending}
                    >
                      {isPending ? <span className="loading loading-spinner"></span> : confirmText}
                    </button>
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

export default ConfirmationDialog;
// src/components/ui/modals/ConfirmationDialog.tsx