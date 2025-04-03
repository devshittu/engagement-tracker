// src/components/Modal/Modal.tsx
'use client';

import React, { useEffect, useRef, ReactNode } from 'react';
import FocusLock from 'react-focus-lock';
import Transition from '../Transition/Transition';
import { logger } from '@/lib/logger';

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

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (
        !show ||
        !modalContent.current ||
        modalContent.current.contains(event.target as Node)
      ) {
        return;
      }
      logger.info('Modal closed via outside click', { id, ariaLabel });
      handleClose();
    };

    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [show, handleClose, id, ariaLabel]);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      logger.info('Modal closed via Escape key', { id, ariaLabel });
      handleClose();
    };

    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [handleClose, id, ariaLabel]);

  logger.debug('Rendering Modal', { id, show, ariaLabel });

  return (
    <>
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
        <FocusLock disabled={!show} returnFocus>
          <div
            className="bg-white overflow-auto max-w-6xl w-full max-h-full"
            ref={modalContent}
          >
            {children}
          </div>
        </FocusLock>
      </Transition>
    </>
  );
};

export default Modal;
// src/components/Modal/Modal.tsx
