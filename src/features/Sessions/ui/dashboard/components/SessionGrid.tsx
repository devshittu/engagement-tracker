// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
// src/features/Sessions/ui/dashboard/components/SessionGrid.tsx
'use client';

import React from 'react';
import { ActiveSessionsResponse } from '@/features/Sessions/hooks/useActiveSessions';
import GroupSessionCard from '@/features/Sessions/ui/cards/GroupSessionCard';
import OneToOneSessionCard from '../../cards/OneToOneSessionCard';
import { logger } from '@/lib/logger';

type SessionGridProps = {
  oneToOneData?: ActiveSessionsResponse;
  groupData?: ActiveSessionsResponse;
  onDecline: (session: any) => (event: React.MouseEvent) => void;
  onEndSession: (
    sessionId: number,
    serviceUserName: string,
  ) => (event: React.MouseEvent) => void;
};

const SessionGrid: React.FC<SessionGridProps> = ({
  oneToOneData,
  groupData,
  onDecline,
  onEndSession,
}) => {
  const oneToOneSessions =
    'sessions' in (oneToOneData ?? {}) ? oneToOneData.sessions : [];
  const groupSessions = 'groups' in (groupData ?? {}) ? groupData.groups : [];
  const sessionsToDisplay = oneToOneSessions.slice(0, 6 - groupSessions.length);

  if (oneToOneSessions.length === 0 && groupSessions.length === 0) {
    logger.info('No active sessions to display');
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[40vh]">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          No Active Sessions
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-xl mb-4">
          To start a session, use the search box below to find a service user
          you want to engage.
        </p>
        <p className="text-base text-gray-500 dark:text-gray-400">
          <em>Then come back here once a session is started!</em>
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {groupSessions.map((group) => (
        <GroupSessionCard
          key={group.groupRef}
          groupRef={group.groupRef}
          groupDescription={group.groupDescription}
          sessions={group.sessions}
        />
      ))}
      {sessionsToDisplay.map((session) => (
        <OneToOneSessionCard
          key={session.id}
          session={session}
          onDecline={onDecline(session)}
          onEndSession={onEndSession(
            session.id,
            session.admission.serviceUser.name,
          )}
        />
      ))}
    </div>
  );
};

export default SessionGrid;
