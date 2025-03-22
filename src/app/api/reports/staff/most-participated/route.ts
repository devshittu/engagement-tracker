// src/app/api/reports/staff/most-participated/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPeriodDates, log } from '@/lib/reportUtils';

export async function GET(req: NextRequest) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('REPORTS:STAFF:MOST-PARTICIPATED', 'Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get('period') as 'month' | 'year') || 'month';

  if (!['month', 'year'].includes(period)) {
    log('REPORTS:STAFF:MOST-PARTICIPATED', 'Invalid period', { period });
    return NextResponse.json(
      { error: 'Invalid period. Use month or year.' },
      { status: 400 },
    );
  }

  try {
    const { currentStart, currentEnd } = getPeriodDates(period);
    log('REPORTS:STAFF:MOST-PARTICIPATED', 'Fetching most participated staff', {
      period,
    });

    const sessions = await prisma.session.groupBy({
      by: ['facilitatedById'],
      _count: { id: true },
      where: { timeIn: { gte: currentStart, lte: currentEnd } },
      orderBy: { _count: { id: 'desc' } },
    });

    const staffIds = sessions.map((s) => s.facilitatedById);
    const [staffDetails, sessionDetails] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: staffIds } },
        select: { id: true, name: true },
      }),
      prisma.session.findMany({
        where: {
          facilitatedById: { in: staffIds },
          timeIn: { gte: currentStart, lte: currentEnd },
        },
        include: { admission: true },
      }),
    ]);

    const data = sessions.map((session) => {
      const staff = staffDetails.find((s) => s.id === session.facilitatedById);
      const staffSessions = sessionDetails.filter(
        (s) => s.facilitatedById === session.facilitatedById,
      );
      const uniqueServiceUsers = new Set(
        staffSessions.map((s) => s.admission.serviceUserId),
      ).size;
      return {
        staffId: session.facilitatedById,
        staffName: staff?.name || 'Unknown',
        sessionCount: session._count.id,
        uniqueServiceUsers,
      };
    });

    const top = data[0] || null;

    log('REPORTS:STAFF:MOST-PARTICIPATED', 'Most participated staff fetched', {
      topStaff: top?.staffName,
    });
    return NextResponse.json({
      period,
      startDate: currentStart.toISOString(),
      endDate: currentEnd.toISOString(),
      data,
      top,
    });
  } catch (error) {
    log(
      'REPORTS:STAFF:MOST-PARTICIPATED',
      'Failed to fetch most participated staff',
      error,
    );
    return NextResponse.json(
      { error: 'Failed to fetch most participated staff' },
      { status: 500 },
    );
  }
}

// Description: Ranks staff by session count and service user engagement in a period, identifying top performers.
// Notes:
// Data: Ranks staff for a Bar Chart (staff names vs. session count), includes service user engagement.
// Top Performer: Highlights the highest-ranking staff.
// Auth: Secured with x-supabase-user.
