// src/features/Sessions/lib/sessionUtils.ts
import { logger } from '@/lib/logger';

export const getSessionIdentifier = (session: any, isGroup: boolean): string => {
  const identifier = isGroup ? session.groupRef : session.id;
  logger.debug('Generated session identifier', { isGroup, identifier });
  return identifier;
};

export const getSessionType = (session: any): 'ONE_TO_ONE' | 'GROUP' => {
  const sessionType = session.type === 'GROUP' ? 'GROUP' : 'ONE_TO_ONE';
  logger.debug('Determined session type', { sessionId: session.id, sessionType });
  return sessionType;
};
// src/features/Sessions/lib/sessionUtils.ts