// src/app/api/service-users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

type Params = { params: { id: string } };

const log = (message: string, data?: any) =>
  console.log(`[API:SERVICE-USERS/ID] ${message}`, data ? JSON.stringify(data, null, 2) : '');

export async function GET(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { id: serviceUserIdStr } = params;
  const serviceUserId: number = parseInt(serviceUserIdStr, 10);

  if (isNaN(serviceUserId)) {
    log('Invalid service user ID', { serviceUserId });
    return NextResponse.json({ error: 'Invalid service user ID' }, { status: 400 });
  }

  try {
    log('Fetching service user', { serviceUserId });
    const serviceUser = await prisma.serviceUser.findUnique({
      where: { id: serviceUserId },
      include: { admissions: { orderBy: { admissionDate: 'desc' } } },
    });

    if (!serviceUser) {
      log('Service user not found', { serviceUserId });
      return NextResponse.json({ error: 'Service user not found' }, { status: 404 });
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
  } catch (error: unknown) {
    log('Failed to fetch service user', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to fetch service user' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { id: serviceUserIdStr } = params;
  const serviceUserId: number = parseInt(serviceUserIdStr, 10);

  if (isNaN(serviceUserId)) {
    log('Invalid service user ID', { serviceUserId });
    return NextResponse.json({ error: 'Invalid service user ID' }, { status: 400 });
  }

  let nhsNumber: string | undefined;
  try {
    const data = await req.json();
    nhsNumber = data.nhsNumber;
    const { name } = data;
    log('Updating service user', { serviceUserId, name, nhsNumber });

    if ((!name || typeof name !== 'string') && (!nhsNumber || typeof nhsNumber !== 'string')) {
      log('Invalid input', { name, nhsNumber });
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
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log('Service user not found', { serviceUserId });
        return NextResponse.json({ error: 'Service user not found' }, { status: 404 });
      }
      if (error.code === 'P2002') {
        log('NHS number already exists', { nhsNumber });
        return NextResponse.json({ error: 'NHS number already exists' }, { status: 409 });
      }
    }
    log('Failed to update service user', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to update service user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { id: serviceUserIdStr } = params;
  const serviceUserId: number = parseInt(serviceUserIdStr, 10);

  if (isNaN(serviceUserId)) {
    log('Invalid service user ID', { serviceUserId });
    return NextResponse.json({ error: 'Invalid service user ID' }, { status: 400 });
  }

  try {
    log('Deleting service user', { serviceUserId });
    await prisma.serviceUser.delete({
      where: { id: serviceUserId },
    });
    log('Service user deleted successfully', { serviceUserId });
    return NextResponse.json({ message: 'Service user deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log('Service user not found', { serviceUserId });
        return NextResponse.json({ error: 'Service user not found' }, { status: 404 });
      }
      if (error.code === 'P2003') {
        log('Service user has associated admissions', { serviceUserId });
        return NextResponse.json(
          { error: 'Cannot delete service user with associated admissions' },
          { status: 409 },
        );
      }
    }
    log('Failed to delete service user', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to delete service user' }, { status: 500 });
  }
}
// src/app/api/service-users/[id]/route.ts
