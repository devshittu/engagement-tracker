// src/lib/cron/autoEndSessions.ts
// import { apiClient } from '@/lib/api-client';

// export async function autoEndSessions() {
//   try {
//     await apiClient.post('/api/sessions/auto-end');
//     logger.debug('Auto-end job executed successfully');
//   } catch (error) {
//     console.error('Error in auto-end job:', error instanceof Error ? error.message : String(error));
//   }
// }

// Note: This script should be scheduled via a cron job (e.g., using node-cron or a container scheduler)

import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

async function autoEndSessions() {
  try {
    const ongoingSessions = await prisma.session.findMany({
      where: {
        status: 'ONGOING',
        timeIn: {
          lte: new Date(Date.now() - 5 * 60 * 1000), // Check sessions older than 5 minutes
        },
      },
      include: {
        activityLog: true,
      },
    });

    for (const session of ongoingSessions) {
      const duration = session.activityLog.duration || 60; // Default to 60 minutes if null
      const expectedEndTime = new Date(
        session.timeIn.getTime() + duration * 60 * 1000,
      );

      if (new Date() >= expectedEndTime) {
        await prisma.session.update({
          where: { id: session.id },
          data: {
            status: 'COMPLETED',
            timeOut: expectedEndTime,
          },
        });
        logger.info(
          `Auto-ended session ${session.id} at ${expectedEndTime.toISOString()}`,
        );
      }
    }
    logger.info(
      'Auto-end job executed successfully at',
      new Date().toISOString(),
    );
  } catch (error) {
    logger.error(
      'Error in auto-end job at',
      new Date().toISOString(),
      ':',
      error instanceof Error ? error.message : String(error),
    );
  }
}

// Schedule the job to run every hour
cron.schedule('0 * * * *', () => {
  logger.info('Running auto-end sessions job...');
  autoEndSessions();
});

logger.info('Auto-end sessions cron job scheduled to run every hour.');
// src/lib/cron/autoEndSessions.ts
