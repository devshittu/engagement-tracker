// app/api/sessions/[id]/end/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sessionId = Number(id);
  if (isNaN(sessionId)) {
    return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
  }

  try {
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: { timeOut: new Date() },
    });
    return NextResponse.json(session);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 },
    );
  }
}

// src/app/api/sessions/[id]/end/route.ts
