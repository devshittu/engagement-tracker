// src/app/api/serviceUsers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

const log = (message: string, data?: any) =>
  console.log(
    `[API:SERVICE_USERS/ID] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest, { params }: Params) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const serviceUserId = parseInt(id);

  if (isNaN(serviceUserId)) {
    log('Invalid service user ID', { id });
    return NextResponse.json(
      { error: 'Invalid service user ID' },
      { status: 400 },
    );
  }

  try {
    log('Fetching service user', { id: serviceUserId });
    const serviceUser = await prisma.serviceUser.findUnique({
      where: { id: serviceUserId },
      include: { admissions: { orderBy: { admissionDate: 'desc' } } },
    });

    if (!serviceUser) {
      log('Service user not found', { id: serviceUserId });
      return NextResponse.json(
        { error: 'Service user not found' },
        { status: 404 },
      );
    }

    log('Service user fetched successfully', { id: serviceUser.id });
    return NextResponse.json({
      ...serviceUser,
      createdAt: serviceUser.createdAt.toISOString(),
      updatedAt: serviceUser.updatedAt?.toISOString() || null,
      admissions: serviceUser.admissions.map((admission) => ({
        ...admission,
        admissionDate: admission.admissionDate.toISOString(),
        dischargeDate: admission.dischargeDate?.toISOString() || null,
      })),
    });
  } catch (error) {
    log('Failed to fetch service user', error);
    return NextResponse.json(
      { error: 'Failed to fetch service user' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const serviceUserId = parseInt(id);

  if (isNaN(serviceUserId)) {
    log('Invalid service user ID', { id });
    return NextResponse.json(
      { error: 'Invalid service user ID' },
      { status: 400 },
    );
  }

  try {
    const { name, nhsNumber } = await req.json();
    log('Updating service user', { id: serviceUserId, name, nhsNumber });

    if (
      (!name || typeof name !== 'string') &&
      (!nhsNumber || typeof nhsNumber !== 'string')
    ) {
      log('Invalid input');
      return NextResponse.json(
        { error: 'At least one valid field (name or NHS number) is required' },
        { status: 400 },
      );
    }

    const serviceUser = await prisma.serviceUser.update({
      where: { id: serviceUserId },
      data: {
        name: name?.trim(),
        nhsNumber: nhsNumber?.trim(),
      },
      include: { admissions: true },
    });

    log('Service user updated successfully', { id: serviceUser.id });
    return NextResponse.json({
      ...serviceUser,
      createdAt: serviceUser.createdAt.toISOString(),
      updatedAt: serviceUser.updatedAt?.toISOString() || null,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      log('Service user not found', { id: serviceUserId });
      return NextResponse.json(
        { error: 'Service user not found' },
        { status: 404 },
      );
    }
    if (error.code === 'P2002') {
      log('NHS number already exists', { nhsNumber });
      return NextResponse.json(
        { error: 'NHS number already exists' },
        { status: 409 },
      );
    }
    log('Failed to update service user', error);
    return NextResponse.json(
      { error: 'Failed to update service user' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const serviceUserId = parseInt(id);

  if (isNaN(serviceUserId)) {
    log('Invalid service user ID', { id });
    return NextResponse.json(
      { error: 'Invalid service user ID' },
      { status: 400 },
    );
  }

  try {
    log('Deleting service user', { id: serviceUserId });
    await prisma.serviceUser.delete({
      where: { id: serviceUserId },
    });
    log('Service user deleted successfully', { id: serviceUserId });
    return NextResponse.json({ message: 'Service user deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      log('Service user not found', { id: serviceUserId });
      return NextResponse.json(
        { error: 'Service user not found' },
        { status: 404 },
      );
    }
    if (error.code === 'P2003') {
      log('Service user has associated admissions', { id: serviceUserId });
      return NextResponse.json(
        { error: 'Cannot delete service user with associated admissions' },
        { status: 409 },
      );
    }
    log('Failed to delete service user', error);
    return NextResponse.json(
      { error: 'Failed to delete service user' },
      { status: 500 },
    );
  }
}
// src/app/api/serviceUsers/[id]/route.ts
