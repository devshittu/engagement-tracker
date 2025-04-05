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
  setDecliningSession: (session: DecliningSession | null) => void;
  clearDecliningSession: () => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
  decliningSession: null,
  setDecliningSession: (session) => {
    logger.info('Setting declining session', { session });
    set({ decliningSession: session });
  },
  clearDecliningSession: () => {
    logger.info('Clearing declining session');
    set({ decliningSession: null });
  },
}));
// src/stores/sessionStore.ts