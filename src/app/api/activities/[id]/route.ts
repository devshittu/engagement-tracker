import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const activityId = parseInt(id);

  if (isNaN(activityId)) {
    return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  });

  if (!activity) {
    return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
  }

  return NextResponse.json(activity);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const activityId = parseInt(id);

  if (isNaN(activityId)) {
    return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
  }

  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const activity = await prisma.activity.update({
    where: { id: activityId },
    data: { name },
  });

  return NextResponse.json(activity);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const activityId = parseInt(id);

  if (isNaN(activityId)) {
    return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
  }

  await prisma.activity.delete({
    where: { id: activityId },
  });

  return NextResponse.json({ message: 'Activity deleted successfully' });
}
