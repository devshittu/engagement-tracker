import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET() {
  const activities = await prisma.activity.findMany();
  return NextResponse.json(activities);
}

export async function POST(request: Request) {
  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const activity = await prisma.activity.create({
    data: { name },
  });

  return NextResponse.json(activity, { status: 201 });
}


export async function PUT(request: Request) {
  const body = await request.json();
  const { id, name } = body;

  if (!id || !name) {
    return NextResponse.json(
      { error: 'Activity ID and name are required.' },
      { status: 400 },
    );
  }

  const updatedActivity = await prisma.activity.update({
    where: { id },
    data: { name },
  });

  return NextResponse.json(updatedActivity);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: 'Activity ID is required.' },
      { status: 400 },
    );
  }

  await prisma.activity.delete({ where: { id } });

  return NextResponse.json({ message: 'Activity deleted successfully.' });
}

// src/app/api/activities/route.ts
