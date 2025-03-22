// src/app/api/activities/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateActivityInput } from '@/features/activities/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userHeader = request.headers.get('x-supabase-user');
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(params.id) },
      include: { department: true },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(activity, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error fetching activity ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userHeader = request.headers.get('x-supabase-user');
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userHeader);
    const body: UpdateActivityInput = await request.json();

    const activity = await prisma.activity.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        description: body.description,
        departmentId: body.departmentId ?? null,
        updatedAt: new Date(),
      },
      include: { department: true },
    });

    return NextResponse.json(activity, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error updating activity ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userHeader = request.headers.get('x-supabase-user');
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.activity.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json(
      { message: 'Activity deleted successfully' },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error(`Error deleting activity ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
