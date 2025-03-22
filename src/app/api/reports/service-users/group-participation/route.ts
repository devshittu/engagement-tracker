// src/app/api/reports/service-users/group-participation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPeriodDates, log } from '@/lib/reportUtils';

export async function GET(req: NextRequest) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log(
      'REPORTS:SERVICE-USERS:GROUP-PARTICIPATION',
      'Unauthorized access attempt',
    );
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get('period') as 'month' | 'year') || 'month';
  const compareTo = searchParams.get('compareTo') as
    | 'last'
    | 'custom'
    | undefined;
  const customDate = searchParams.get('customDate');

  if (!['month', 'year'].includes(period)) {
    log('REPORTS:SERVICE-USERS:GROUP-PARTICIPATION', 'Invalid period', {
      period,
    });
    return NextResponse.json(
      { error: 'Invalid period. Use month or year.' },
      { status: 400 },
    );
  }

  try {
    const { currentStart, currentEnd, previousStart, previousEnd } =
      getPeriodDates(period, compareTo, customDate);
    log(
      'REPORTS:SERVICE-USERS:GROUP-PARTICIPATION',
      'Fetching group participation',
      { period, compareTo },
    );

    const [currentGroups, previousGroups] = await Promise.all([
      prisma.session.groupBy({
        by: ['groupRef'],
        _count: { id: true },
        where: {
          type: 'GROUP',
          timeIn: { gte: currentStart, lte: currentEnd },
        },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.session.groupBy({
        by: ['groupRef'],
        _count: { id: true },
        where: {
          type: 'GROUP',
          timeIn: { gte: previousStart, lte: previousEnd },
        },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    const fetchGroupDetails = async (
      groups: { groupRef: string; _count: { id: number } }[],
    ) => {
      const groupRefs = groups
        .map((g) => g.groupRef)
        .filter(Boolean) as string[];
      const sessions = await prisma.session.findMany({
        where: { groupRef: { in: groupRefs } },
        include: { activityLog: { include: { activity: true } } },
        take: 1, // Just need one session per groupRef for activity name
      });

      return groups.map((group) => {
        const session = sessions.find((s) => s.groupRef === group.groupRef);
        return {
          groupRef: group.groupRef,
          count: group._count.id,
          activityName: session?.activityLog.activity.name || 'Unknown',
        };
      });
    };

    const [currentData, previousData] = await Promise.all([
      fetchGroupDetails(currentGroups),
      fetchGroupDetails(previousGroups),
    ]);

    const trend = {
      totalCurrent: currentData.reduce((sum, g) => sum + g.count, 0),
      totalPrevious: previousData.reduce((sum, g) => sum + g.count, 0),
      percentageChange:
        previousData.length > 0
          ? ((currentData.reduce((sum, g) => sum + g.count, 0) -
              previousData.reduce((sum, g) => sum + g.count, 0)) /
              previousData.reduce((sum, g) => sum + g.count, 0)) *
            100
          : 0,
    };

    log(
      'REPORTS:SERVICE-USERS:GROUP-PARTICIPATION',
      'Group participation fetched',
      {
        currentGroups: currentData.length,
        previousGroups: previousData.length,
      },
    );
    return NextResponse.json({
      period,
      currentData,
      previousData,
      trend,
    });
  } catch (error) {
    log(
      'REPORTS:SERVICE-USERS:GROUP-PARTICIPATION',
      'Failed to fetch group participation',
      error,
    );
    return NextResponse.json(
      { error: 'Failed to fetch group participation' },
      { status: 500 },
    );
  }
}
// Description: Aggregates group session participation across all service users in a period, showing most active groups and trends.

// Notes:
// Data: Provides group participation counts for a Bar Chart (groupRefs) with a Line overlay (trend).
// Comparison: Includes current and previous period data.
// Auth: Secured with x-supabase-user.
