import { getAuthUserId } from '@/lib/utils/auth';
import { NextRequest, NextResponse } from 'next/server';
import { SessionType } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: { type: string } },
) {
  const userId = await getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const type = params.type as SessionType;
    if (!['one-to-one', 'group'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid session type' },
        { status: 400 },
      );
    }
    const result = await endAllSessionsByType(
      type === 'one-to-one' ? 'ONE_TO_ONE' : 'GROUP',
    );
    return NextResponse.json(
      {
        message: `Ended ${result.count} ${type} sessions`,
        count: result.count,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to end sessions' },
      { status: 500 },
    );
  }
}
