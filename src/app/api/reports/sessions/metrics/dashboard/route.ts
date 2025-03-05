import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek } from 'date-fns';

export async function GET(request: Request) {
  try {
    // Define the current week's boundaries (assuming week starts on Monday)
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Calculate sample metrics from your database:
    // 1. Sessions this week
    // 2. New Service Users this week
    // 3. Admissions this week

    const [sessionCount, newUsersCount, admissionCount] = await Promise.all([
      prisma.session.count({
        where: { timeIn: { gte: weekStart, lte: weekEnd } },
      }),
      prisma.serviceUser.count({
        where: { createdAt: { gte: weekStart, lte: weekEnd } },
      }),
      prisma.admission.count({
        where: { admissionDate: { gte: weekStart, lte: weekEnd } },
      }),
    ]);

    // For demonstration, we'll add dummy percentage change calculations.
    // In a real scenario, calculate these based on previous periods.
    const metrics = [
      {
        title: 'Sessions This Week',
        value: sessionCount,
        change: sessionCount ? ((sessionCount - 50) / 50) * 100 : 0, // dummy calculation
        positive: sessionCount >= 50,
      },
      {
        title: 'New Service Users This Week',
        value: newUsersCount,
        change: newUsersCount ? ((newUsersCount - 20) / 20) * 100 : 0, // dummy calculation
        positive: newUsersCount >= 20,
      },
      {
        title: 'Admissions This Week',
        value: admissionCount,
        change: admissionCount ? ((admissionCount - 10) / 10) * 100 : 0, // dummy calculation
        positive: admissionCount >= 10,
      },
    ];

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to fetch dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 },
    );
  }
}

// src/app/api/reports/sessions/metrics/dashboard/route.ts
