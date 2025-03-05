import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Acceptable period values: day, week, month, year
    const period = searchParams.get('period') || 'week'; // default to week
    const weekday = searchParams.get('weekday'); // optional: e.g. "Tue"

    let currentStart: Date,
      currentEnd: Date,
      previousStart: Date,
      previousEnd: Date;

    // Set current and previous period based on the period selection.
    if (period === 'day') {
      currentStart = startOfDay(new Date());
      currentEnd = endOfDay(new Date());
      previousStart = startOfDay(subDays(new Date(), 1));
      previousEnd = endOfDay(subDays(new Date(), 1));
    } else if (period === 'week') {
      currentStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      currentEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      previousStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
      previousEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
    } else if (period === 'month') {
      currentStart = startOfMonth(new Date());
      currentEnd = endOfMonth(new Date());
      previousStart = startOfMonth(subMonths(new Date(), 1));
      previousEnd = endOfMonth(subMonths(new Date(), 1));
    } else if (period === 'year') {
      currentStart = startOfYear(new Date());
      currentEnd = endOfYear(new Date());
      previousStart = startOfYear(subYears(new Date(), 1));
      previousEnd = endOfYear(subYears(new Date(), 1));
    } else {
      return NextResponse.json(
        { error: 'Invalid period. Allowed values: day, week, month, year.' },
        { status: 400 },
      );
    }

    // Determine the grouping label based on period
    let groupByField: 'hourLabel' | 'dayLabel' | 'dayOfMonth' | 'monthLabel';
    if (period === 'day') {
      groupByField = 'hourLabel'; // We'll group by hour, e.g. "1AM", "2AM", ...
    } else if (period === 'week') {
      groupByField = 'dayLabel'; // "Mon", "Tue", etc.
    } else if (period === 'month') {
      groupByField = 'dayOfMonth'; // "1", "2", etc.
    } else {
      groupByField = 'monthLabel'; // "Jan", "Feb", etc.
    }

    // Helper: Build grouping data from raw sessions array.
    const buildGroupData = (
      sessions: any[],
    ): { label: string; count: number }[] => {
      const groups: Record<string, number> = {};
      sessions.forEach((session) => {
        let label: string;
        if (period === 'day') {
          label = format(new Date(session.timeIn), 'ha'); // e.g. "1AM", "2PM"
          if (weekday && label.toLowerCase() !== weekday.toLowerCase()) return;
        } else if (period === 'week') {
          label = format(new Date(session.timeIn), 'EEE'); // e.g. "Mon", "Tue"
          if (weekday && label.toLowerCase() !== weekday.toLowerCase()) return;
        } else if (period === 'month') {
          label = format(new Date(session.timeIn), 'd'); // day number
        } else {
          label = format(new Date(session.timeIn), 'MMM'); // month abbreviation
        }
        groups[label] = (groups[label] || 0) + 1;
      });
      // Determine the order of labels
      let labels: string[];
      if (period === 'day') {
        // Generate hours from 12AM to 11PM (format: "12AM", "1AM", ..., "11PM")
        labels = Array.from({ length: 24 }, (_, i) => {
          return format(new Date(2020, 0, 1, i), 'ha');
        });
      } else if (period === 'week') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      } else if (period === 'month') {
        labels = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
      } else {
        labels = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
      }
      return labels.map((lbl) => ({ label: lbl, count: groups[lbl] || 0 }));
    };

    // Fetch sessions for current and previous periods
    const [currentSessions, previousSessions] = await Promise.all([
      prisma.session.findMany({
        where: { timeIn: { gte: currentStart, lte: currentEnd } },
      }),
      prisma.session.findMany({
        where: { timeIn: { gte: previousStart, lte: previousEnd } },
      }),
    ]);

    const currentData = buildGroupData(currentSessions);
    const previousData = buildGroupData(previousSessions);

    // Overall totals
    const currentTotal = currentSessions.length;
    const previousTotal = previousSessions.length;
    const percentageChange =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    return NextResponse.json({
      period,
      groupBy: groupByField,
      currentData,
      previousData,
      currentTotal,
      previousTotal,
      percentageChange,
    });
  } catch (error) {
    console.error('Failed to generate trend report:', error);
    return NextResponse.json(
      { error: 'Failed to generate trend report' },
      { status: 500 },
    );
  }
}
// src/app/api/reports/sessions/trend/route.ts
