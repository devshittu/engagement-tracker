// src/app/api/reports/staff/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPeriodDates, log } from '@/lib/reportUtils';
import { SessionType } from '@prisma/client';

export async function GET(req: NextRequest) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('REPORTS:STAFF:SESSIONS', 'Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period =
    (searchParams.get('period') as 'day' | 'week' | 'month') || 'week';
  const date = searchParams.get('date'); // Optional: YYYY-MM-DD for specific day

  if (!['day', 'week', 'month'].includes(period)) {
    log('REPORTS:STAFF:SESSIONS', 'Invalid period', { period });
    return NextResponse.json(
      { error: 'Invalid period. Use day, week, or month.' },
      { status: 400 },
    );
  }

  try {
    const { currentStart, currentEnd } = getPeriodDates(
      period,
      date ? 'custom' : undefined,
      date,
    );
    log('REPORTS:STAFF:SESSIONS', 'Fetching staff session metrics', {
      period,
      date,
    });

    const sessions = await prisma.session.groupBy({
      by: ['facilitatedById'],
      _count: { id: true },
      where: {
        timeIn: { gte: currentStart, lte: currentEnd },
      },
    });

    const staffIds = sessions.map((s) => s.facilitatedById);
    const staffDetails = await prisma.user.findMany({
      where: { id: { in: staffIds } },
      select: { id: true, name: true },
    });

    const breakdown = await prisma.session.groupBy({
      by: ['facilitatedById', 'type'],
      _count: { id: true },
      where: {
        timeIn: { gte: currentStart, lte: currentEnd },
      },
    });

    const data = sessions.map((session) => {
      const staff = staffDetails.find((s) => s.id === session.facilitatedById);
      const groupCount =
        breakdown.find(
          (b) =>
            b.facilitatedById === session.facilitatedById &&
            b.type === SessionType.GROUP,
        )?._count.id || 0;
      const oneToOneCount =
        breakdown.find(
          (b) =>
            b.facilitatedById === session.facilitatedById &&
            b.type === SessionType.ONE_TO_ONE,
        )?._count.id || 0;
      return {
        staffId: session.facilitatedById,
        staffName: staff?.name || 'Unknown',
        totalSessions: session._count.id,
        groupSessions: groupCount,
        oneToOneSessions: oneToOneCount,
      };
    });

    const totals = {
      totalSessions: data.reduce((sum, d) => sum + d.totalSessions, 0),
      totalStaff: data.length,
      averageSessionsPerStaff:
        data.length > 0
          ? data.reduce((sum, d) => sum + d.totalSessions, 0) / data.length
          : 0,
    };

    log('REPORTS:STAFF:SESSIONS', 'Staff session metrics fetched', {
      totalStaff: data.length,
      totalSessions: totals.totalSessions,
    });
    return NextResponse.json({
      period,
      startDate: currentStart.toISOString(),
      endDate: currentEnd.toISOString(),
      data,
      totals,
    });
  } catch (error) {
    log(
      'REPORTS:STAFF:SESSIONS',
      'Failed to fetch staff session metrics',
      error,
    );
    return NextResponse.json(
      { error: 'Failed to fetch staff session metrics' },
      { status: 500 },
    );
  }
}

// Description: Counts sessions facilitated by each staff member in a period (e.g., last week, a specific day), with totals and averages.

// Notes:
// Data: Provides per-staff session counts for a Bar Chart (staff names vs. total sessions), with group vs. one-to-one breakdown.
// Flexibility: Supports specific dates via date param or defaults to current period.
// Auth: Secured with x-supabase-user.
