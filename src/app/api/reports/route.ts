// app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getActivityReport } from '@/lib/reports';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timeFrame = searchParams.get('timeFrame') as
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | undefined;

  if (
    !timeFrame ||
    !['daily', 'weekly', 'monthly', 'yearly'].includes(timeFrame)
  ) {
    return NextResponse.json(
      { error: 'Invalid or missing timeFrame' },
      { status: 400 },
    );
  }

  try {
    const reportData = await getActivityReport(timeFrame);
    return NextResponse.json(reportData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 },
    );
  }
}
