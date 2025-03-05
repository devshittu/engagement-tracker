'use client';

import React, { useEffect, useRef, ReactNode } from 'react';
import Transition from '../Transition/Transition';

export interface ModalProps {
  children: ReactNode;
  id?: string;
  ariaLabel?: string;
  show: boolean;
  handleClose: () => void;
}

const Modal: React.FC<ModalProps> = ({
  children,
  id,
  ariaLabel,
  show,
  handleClose,
}) => {
  const modalContent = useRef<HTMLDivElement>(null);

  // Close the modal when clicking outside of the modal content.
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      // If modal is not shown, or if the click is inside the modal, do nothing.
      if (
        !show ||
        !modalContent.current ||
        modalContent.current.contains(event.target as Node)
      ) {
        return;
      }
      handleClose();
    };

    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [show, handleClose]);

  // Close the modal if the Escape key is pressed.
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      handleClose();
    };

    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [handleClose]);

  return (
    <>
      {/* Modal backdrop */}
      <Transition
        className="fixed inset-0 z-50 bg-white bg-opacity-75 transition-opacity blur"
        show={show}
        enter="transition ease-out duration-200"
        enterStart="opacity-0"
        enterEnd="opacity-100"
        leave="transition ease-out duration-100"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
        aria-hidden="true"
      >
        {''}
      </Transition>

      {/* Modal dialog */}
      <Transition
        id={id}
        className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center transform px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabel}
        show={show}
        enter="transition ease-out duration-200"
        enterStart="opacity-0 scale-95"
        enterEnd="opacity-100 scale-100"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100 scale-100"
        leaveEnd="opacity-0 scale-95"
      >
        <div
          className="bg-white overflow-auto max-w-6xl w-full max-h-full"
          ref={modalContent}
        >
          {children}
        </div>
      </Transition>
    </>
  );
};

export default Modal;
// src/components/Modal/Modal.tsx
