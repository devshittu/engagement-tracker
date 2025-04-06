// src/stores/sessionStore.ts

import { create } from 'zustand';
import { logger } from '@/lib/logger';

type DecliningSession = {
  id: number;
  serviceUserName: string;
  activityName: string;
};

type SessionStore = {
  decliningSession: DecliningSession | null;
  renderTrigger: number;
  setDecliningSession: (session: DecliningSession | null) => void;
  clearDecliningSession: () => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
  decliningSession: null,
  renderTrigger: 0,
  setDecliningSession: (session) => {
    logger.info('Setting declining session', { session });
    set((state) => ({
      decliningSession: session,
      renderTrigger: state.renderTrigger + 1,
    }));
    logger.debug('Declining session set', { session });
  },
  clearDecliningSession: () => {
    logger.info('Clearing declining session');
    set((state) => ({
      decliningSession: null,
      renderTrigger: state.renderTrigger + 1,
    }));
    logger.debug('Declining session cleared');
  },
}));
// src/stores/sessionStore.ts