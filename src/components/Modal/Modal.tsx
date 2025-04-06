// src/components/Modal/Modal.tsx
'use client';

import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
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
  const lastOpenTime = useRef<number>(0);
  const portalRoot = useRef<HTMLElement | null>(null);

  useEffect(() => {
    portalRoot.current = document.getElementById('modal-root') || document.body;
    if (!portalRoot.current) {
      logger.error('Portal root not found', { id, ariaLabel });
    }
    if (show) {
      lastOpenTime.current = Date.now();
      logger.debug('Modal mounted', { id, ariaLabel, show });
    }
    return () => {
      logger.debug('Modal unmounted', { id, ariaLabel });
    };
  }, [show, id, ariaLabel]);

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (
        !show ||
        !modalContent.current ||
        modalContent.current.contains(event.target as Node)
      ) {
        return;
      }
      const timeSinceOpen = Date.now() - lastOpenTime.current;
      if (timeSinceOpen < 300) {
        logger.debug('Ignoring early outside click', { id, ariaLabel, timeSinceOpen });
        return;
      }
      logger.info('Modal closed via outside click', {
        id,
        ariaLabel,
        x: event.clientX,
        y: event.clientY,
      });
      handleClose();
    };

    document.addEventListener('click', clickHandler, { capture: true });
    return () => document.removeEventListener('click', clickHandler, { capture: true });
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

  if (!portalRoot.current) {
    logger.error('Cannot render modal, portal root is null', { id, ariaLabel });
    return null;
  }

  return createPortal(
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
    </>,
    portalRoot.current
  );
};

export default Modal;

// src/components/Modal/Modal.tsx
