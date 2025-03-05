import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const serviceUserId = parseInt(url.searchParams.get('id') || '', 10);

  if (isNaN(serviceUserId)) {
    return NextResponse.json(
      { error: 'Invalid serviceUser ID.' },
      { status: 400 },
    );
  }

  const serviceUser = await prisma.serviceUser.findUnique({
    where: { id: serviceUserId },
    include: {
      admissions: {
        include: {
          sessions: true,
          ward: true, // `ward` is included through `Admission`
        },
      },
    },
  });

  if (!serviceUser) {
    return NextResponse.json(
      { error: 'ServiceUser not found.' },
      { status: 404 },
    );
  }

  const serializedServiceUser = {
    ...serviceUser,
    createdAt: serviceUser.createdAt.toISOString(),
    updatedAt: serviceUser.updatedAt?.toISOString() || null,
  };

  return NextResponse.json(serializedServiceUser);
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const serviceUserId = parseInt(url.searchParams.get('id') || '', 10);

  if (isNaN(serviceUserId)) {
    return NextResponse.json(
      { error: 'Invalid serviceUser ID.' },
      { status: 400 },
    );
  }

  const body = await request.json();
  const { name } = body; // `wardId` removed, since it's not a direct property of `ServiceUser`

  try {
    const updatedServiceUser = await prisma.serviceUser.update({
      where: { id: serviceUserId },
      data: { name }, // Only updating fields that exist on `ServiceUser`
    });

    const serializedServiceUser = {
      ...updatedServiceUser,
      createdAt: updatedServiceUser.createdAt.toISOString(),
      updatedAt: updatedServiceUser.updatedAt?.toISOString() || null,
    };

    return NextResponse.json(serializedServiceUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update serviceUser.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const serviceUserId = parseInt(url.searchParams.get('id') || '', 10);

  if (isNaN(serviceUserId)) {
    return NextResponse.json(
      { error: 'Invalid serviceUser ID.' },
      { status: 400 },
    );
  }

  try {
    await prisma.serviceUser.delete({
      where: { id: serviceUserId },
    });
    return NextResponse.json(
      { message: 'ServiceUser deleted successfully.' },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to delete serviceUser.' },
      { status: 500 },
    );
  }
}
// src/app/api/serviceUsers/[id]/route.ts
