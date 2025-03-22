// src/app/api/serviceUsers/[id]/admit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

const log = (message: string, data?: any) =>
  console.log(
    `[API:SERVICE_USERS/ADMIT] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function POST(req: NextRequest, { params }: Params) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = JSON.parse(userJson);
  const creatorId = user.id;
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
    const { wardId } = await req.json();
    log('Admitting service user', { serviceUserId, wardId });

    if (!wardId || !Number.isInteger(wardId)) {
      log('Invalid ward ID');
      return NextResponse.json(
        { error: 'Valid ward ID is required' },
        { status: 400 },
      );
    }

    const admission = await prisma.admission.create({
      data: {
        serviceUserId,
        wardId,
        admissionDate: new Date(),
        dischargeDate: null,
        admittedById: creatorId,
      },
      include: { ward: true, serviceUser: true },
    });

    log('Admission created successfully', { id: admission.id });
    return NextResponse.json(
      {
        ...admission,
        admissionDate: admission.admissionDate.toISOString(),
        dischargeDate: null,
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === 'P2003') {
      log('Invalid foreign key', { serviceUserId, wardId });
      return NextResponse.json(
        { error: 'Service user or ward not found' },
        { status: 404 },
      );
    }
    log('Failed to create admission', error);
    return NextResponse.json(
      { error: 'Failed to create admission' },
      { status: 500 },
    );
  }
}
