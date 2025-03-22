// src/app/api/activities/batch-activate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BatchActivateInput } from '@/features/activities/types';

export async function POST(request: NextRequest) {
  try {
    const userHeader = request.headers.get('x-supabase-user');
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userHeader);
    const userId = user.id;

    const body: BatchActivateInput[] = await request.json();
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const currentDate = new Date();

    await prisma.$transaction(async (tx) => {
      for (const { activityId, activate } of body) {
        if (activate) {
          // Check if the activity is already active
          const existingLog = await tx.activityContinuityLog.findFirst({
            where: {
              activityId,
              discontinuedDate: null,
            },
          });

          if (!existingLog) {
            // Create a new continuity log entry
            await tx.activityContinuityLog.create({
              data: {
                activityId,
                createdById: userId,
                startDate: currentDate,
                discontinuedDate: null,
                reason: null,
                duration: null,
              },
            });
          }
        } else {
          // Discontinue the activity by updating the most recent log
          const existingLog = await tx.activityContinuityLog.findFirst({
            where: {
              activityId,
              discontinuedDate: null,
            },
            orderBy: { startDate: 'desc' },
          });

          if (existingLog) {
            await tx.activityContinuityLog.update({
              where: { id: existingLog.id },
              data: {
                discontinuedDate: currentDate,
                duration: Math.floor(
                  (currentDate.getTime() -
                    new Date(existingLog.startDate).getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
              },
            });
          }
        }
      }
    });

    return NextResponse.json(
      { message: 'Activities updated successfully' },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error('Error in batch-activate:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
