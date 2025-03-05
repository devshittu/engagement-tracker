// lib/reports.ts
import { prisma } from '@/lib/prisma';
import { TimeFrame, ActivityReport } from '@/types/report';
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

export const getActivityReport = async (
  timeFrame: TimeFrame,
): Promise<ActivityReport[]> => {
  let startDate: Date;

  const now = new Date();

  switch (timeFrame) {
    case 'daily':
      startDate = startOfDay(now);
      break;
    case 'weekly':
      startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      break;
    case 'yearly':
      startDate = startOfYear(now);
      break;
    default:
      startDate = startOfDay(now);
  }

  const sessions = await prisma.session.findMany({
    where: {
      timeIn: {
        gte: startDate,
      },
    },
    include: {
      activity: true,
    },
  });

  const reportMap: Record<string, number> = {};

  sessions.forEach((session) => {
    const activityName = session.activity.name;
    reportMap[activityName] = (reportMap[activityName] || 0) + 1;
  });

  const report: ActivityReport[] = Object.entries(reportMap).map(
    ([activityName, count]) => ({
      activityName,
      count,
    }),
  );

  return report;
};
