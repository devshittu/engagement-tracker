// app/api/reports/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { getActivityReport } from '@/lib/reports';

// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const timeFrame = searchParams.get('timeFrame') as
//     | 'daily'
//     | 'weekly'
//     | 'monthly'
//     | 'yearly'
//     | undefined;

//   if (
//     !timeFrame ||
//     !['daily', 'weekly', 'monthly', 'yearly'].includes(timeFrame)
//   ) {
//     return NextResponse.json(
//       { error: 'Invalid or missing timeFrame' },
//       { status: 400 },
//     );
//   }

//   try {
//     const reportData = await getActivityReport(timeFrame);
//     return NextResponse.json(reportData);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: 'Failed to fetch report data' },
//       { status: 500 },
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { getActivityReport } from '@/lib/reports';
import { authenticateRequest } from '@/lib/authMiddleware'; // Import the middleware

export async function GET(request: NextRequest) {
  // Step 1: Replace x-supabase-user with authenticateRequest
  const authResult = await authenticateRequest(request, 0, undefined, (message, data) =>
    console.log(`[REPORTS:ROOT] ${message}`, data ? JSON.stringify(data, null, 2) : ''),
  );
  if (authResult instanceof NextResponse) return authResult;

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
    console.log('[REPORTS:ROOT] Invalid or missing timeFrame', { timeFrame });
    return NextResponse.json(
      { error: 'Invalid or missing timeFrame' },
      { status: 400 },
    );
  }

  try {
    console.log('[REPORTS:ROOT] Fetching activity report', { timeFrame });
    const reportData = await getActivityReport(timeFrame);
    console.log('[REPORTS:ROOT] Activity report fetched', { reportData });
    return NextResponse.json(reportData);
  } catch (error: unknown) { // Step 2: Type error as unknown
    console.error('[REPORTS:ROOT] Failed to fetch report data', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 },
    );
  }
}
