// src/lib/reportUtils.ts
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
  format,
} from 'date-fns';

export const log = (prefix: string, message: string, data?: any) =>
  console.log(
    `[${prefix}] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export const getPeriodDates = (
  period: 'day' | 'week' | 'month' | 'year',
  compareTo?: 'last' | 'custom',
  customDate?: string,
) => {
  const now = new Date();
  let currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date;

  switch (period) {
    case 'day':
      currentStart = startOfDay(now);
      currentEnd = endOfDay(now);
      previousStart =
        compareTo === 'custom' && customDate
          ? startOfDay(new Date(customDate))
          : startOfDay(subDays(now, 1));
      previousEnd =
        compareTo === 'custom' && customDate
          ? endOfDay(new Date(customDate))
          : endOfDay(subDays(now, 1));
      break;
    case 'week':
      currentStart = startOfWeek(now, { weekStartsOn: 1 });
      currentEnd = endOfWeek(now, { weekStartsOn: 1 });
      previousStart =
        compareTo === 'custom' && customDate
          ? startOfWeek(new Date(customDate), { weekStartsOn: 1 })
          : startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      previousEnd =
        compareTo === 'custom' && customDate
          ? endOfWeek(new Date(customDate), { weekStartsOn: 1 })
          : endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      break;
    case 'month':
      currentStart = startOfMonth(now);
      currentEnd = endOfMonth(now);
      previousStart =
        compareTo === 'custom' && customDate
          ? startOfMonth(new Date(customDate))
          : startOfMonth(subMonths(now, 1));
      previousEnd =
        compareTo === 'custom' && customDate
          ? endOfMonth(new Date(customDate))
          : endOfMonth(subMonths(now, 1));
      break;
    case 'year':
      currentStart = startOfYear(now);
      currentEnd = endOfYear(now);
      previousStart =
        compareTo === 'custom' && customDate
          ? startOfYear(new Date(customDate))
          : startOfYear(subYears(now, 1));
      previousEnd =
        compareTo === 'custom' && customDate
          ? endOfYear(new Date(customDate))
          : endOfYear(subYears(now, 1));
      break;
    default:
      throw new Error('Invalid period');
  }

  return { currentStart, currentEnd, previousStart, previousEnd };
};

export const serializeSession = (session: any) => ({
  ...session,
  timeIn: session.timeIn.toISOString(),
  timeOut: session.timeOut?.toISOString() || null,
  createdAt: session.createdAt.toISOString(),
  updatedAt: session.updatedAt?.toISOString() || null,
  admission: session.admission
    ? {
        ...session.admission,
        admissionDate: session.admission.admissionDate.toISOString(),
        dischargeDate: session.admission.dischargeDate?.toISOString() || null,
      }
    : undefined,
});
