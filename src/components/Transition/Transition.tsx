'use client';

import React, {
  useRef,
  useEffect,
  useContext,
  createContext,
  ReactNode,
  HTMLAttributes,
} from 'react';
import { CSSTransition as ReactCSSTransition } from 'react-transition-group';

const TransitionContext = createContext<{
  parent: { show: boolean; isInitialRender: boolean; appear?: boolean };
}>({
  parent: { show: false, isInitialRender: true },
});

function useIsInitialRender(): boolean {
  const isInitialRender = useRef(true);
  useEffect(() => {
    isInitialRender.current = false;
  }, []);
  return isInitialRender.current;
}

// Props for your custom CSSTransition
interface CSSTransitionProps extends HTMLAttributes<HTMLElement> {
  show: boolean;
  enter?: string;
  enterStart?: string;
  enterEnd?: string;
  leave?: string;
  leaveStart?: string;
  leaveEnd?: string;
  appear?: boolean;
  unmountOnExit?: boolean;
  tag?: keyof JSX.IntrinsicElements; // e.g. 'div', 'span', etc.
  children: ReactNode;
}

const CSSTransition: React.FC<CSSTransitionProps> = ({
  show,
  enter = '',
  enterStart = '',
  enterEnd = '',
  leave = '',
  leaveStart = '',
  leaveEnd = '',
  appear,
  unmountOnExit,
  tag = 'div',
  children,
  ...rest
}) => {
  // Fix: Narrow nodeRef to HTMLElement | null to avoid huge union types
  const nodeRef = useRef<HTMLElement | null>(null);

  const enterClasses = enter.split(' ').filter(Boolean);
  const enterStartClasses = enterStart.split(' ').filter(Boolean);
  const enterEndClasses = enterEnd.split(' ').filter(Boolean);
  const leaveClasses = leave.split(' ').filter(Boolean);
  const leaveStartClasses = leaveStart.split(' ').filter(Boolean);
  const leaveEndClasses = leaveEnd.split(' ').filter(Boolean);

  // Helper functions
  function addClasses(node: HTMLElement, classes: string[]) {
    if (classes.length) node.classList.add(...classes);
  }

  function removeClasses(node: HTMLElement, classes: string[]) {
    if (classes.length) node.classList.remove(...classes);
  }

  // Use react-transition-group's CSSTransition with your nodeRef
  return (
    <ReactCSSTransition
      appear={appear}
      nodeRef={nodeRef}
      unmountOnExit={unmountOnExit}
      in={show}
      addEndListener={(done) => {
        nodeRef.current?.addEventListener('transitionend', done, false);
      }}
      onEnter={() => {
        if (!unmountOnExit && nodeRef.current) {
          nodeRef.current.style.display = '';
          addClasses(nodeRef.current, [...enterClasses, ...enterStartClasses]);
        }
      }}
      onEntering={() => {
        if (nodeRef.current) {
          removeClasses(nodeRef.current, enterStartClasses);
          addClasses(nodeRef.current, enterEndClasses);
        }
      }}
      onEntered={() => {
        if (nodeRef.current) {
          removeClasses(nodeRef.current, [...enterEndClasses, ...enterClasses]);
        }
      }}
      onExit={() => {
        if (nodeRef.current) {
          addClasses(nodeRef.current, [...leaveClasses, ...leaveStartClasses]);
        }
      }}
      onExiting={() => {
        if (nodeRef.current) {
          removeClasses(nodeRef.current, leaveStartClasses);
          addClasses(nodeRef.current, leaveEndClasses);
        }
      }}
      onExited={() => {
        if (nodeRef.current) {
          removeClasses(nodeRef.current, [...leaveEndClasses, ...leaveClasses]);
          if (!unmountOnExit) nodeRef.current.style.display = 'none';
        }
      }}
    >
      {React.createElement(
        tag,
        {
          ref: nodeRef,
          ...rest,
          // If not unmounting from the DOM, default to display:none
          style: !unmountOnExit ? { display: 'none' } : undefined,
        },
        children,
      )}
    </ReactCSSTransition>
  );
};

// A simpler wrapper that uses context, if needed:
interface TransitionProps extends HTMLAttributes<HTMLElement> {
  show?: boolean;
  appear?: boolean;
  children: ReactNode;
  [key: string]: any; // catch-all for your extra props
}

const Transition: React.FC<TransitionProps> = ({
  show,
  appear,
  children,
  ...rest
}) => {
  const { parent } = useContext(TransitionContext);
  const isInitialRender = useIsInitialRender();
  const isChild = show === undefined;

  if (isChild) {
    return (
      <CSSTransition
        appear={parent.appear || !parent.isInitialRender}
        show={parent.show}
        {...rest}
      >
        {children}
      </CSSTransition>
    );
  }

  return (
    <TransitionContext.Provider
      value={{
        parent: {
          show: show as boolean,
          isInitialRender,
          appear,
        },
      }}
    >
      <CSSTransition show={show!} appear={appear} {...rest}>
        {children}
      </CSSTransition>
    </TransitionContext.Provider>
  );
};

export default Transition;

// src/components/Transition/Transition.tsx
