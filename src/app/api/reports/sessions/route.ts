import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
} from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // 'week', 'month', or 'year'
    const groupBy = searchParams.get('groupBy'); // optional, e.g. "admissionId" or "activityId"

    let currentStart: Date,
      currentEnd: Date,
      previousStart: Date,
      previousEnd: Date;
    const now = new Date();

    if (period === 'week') {
      currentStart = startOfWeek(now, { weekStartsOn: 1 });
      currentEnd = endOfWeek(now, { weekStartsOn: 1 });
      previousStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      previousEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    } else if (period === 'month') {
      currentStart = startOfMonth(now);
      currentEnd = endOfMonth(now);
      previousStart = startOfMonth(subMonths(now, 1));
      previousEnd = endOfMonth(subMonths(now, 1));
    } else if (period === 'year') {
      currentStart = startOfYear(now);
      currentEnd = endOfYear(now);
      previousStart = startOfYear(subYears(now, 1));
      previousEnd = endOfYear(subYears(now, 1));
    } else {
      return NextResponse.json(
        { error: 'Invalid period. Use week, month, or year.' },
        { status: 400 },
      );
    }

    // If groupBy is provided, use groupBy queries; else, use aggregate.
    if (groupBy) {
      const allowedGroupByFields = ['admissionId', 'activityId']; // Extend as needed.
      if (!allowedGroupByFields.includes(groupBy)) {
        return NextResponse.json(
          {
            error: `Invalid groupBy field. Allowed: ${allowedGroupByFields.join(', ')}`,
          },
          { status: 400 },
        );
      }

      // Group data for the current period.
      const currentGroup = await prisma.session.groupBy({
        by: [groupBy as any],
        _count: { id: true },
        where: {
          timeIn: { gte: currentStart, lte: currentEnd },
        },
        orderBy: { [groupBy]: 'asc' },
      });

      // Group data for the previous period.
      const previousGroup = await prisma.session.groupBy({
        by: [groupBy as any],
        _count: { id: true },
        where: {
          timeIn: { gte: previousStart, lte: previousEnd },
        },
        orderBy: { [groupBy]: 'asc' },
      });

      return NextResponse.json({
        period,
        groupBy,
        current: currentGroup,
        previous: previousGroup,
      });
    } else {
      // When no groupBy is provided, use aggregate queries.
      const currentAggregate = await prisma.session.aggregate({
        _count: { id: true },
        where: { timeIn: { gte: currentStart, lte: currentEnd } },
      });

      const previousAggregate = await prisma.session.aggregate({
        _count: { id: true },
        where: { timeIn: { gte: previousStart, lte: previousEnd } },
      });

      return NextResponse.json({
        period,
        current: currentAggregate,
        previous: previousAggregate,
        trend: {
          countDifference:
            currentAggregate._count.id - previousAggregate._count.id,
        },
      });
    }
  } catch (error) {
    console.error('Failed to generate report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 },
    );
  }
}

// src/app/api/reports/sessions/route.ts
