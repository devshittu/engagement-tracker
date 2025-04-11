// src/app/api/service-users/[id]/admit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

type Params = { params: Promise<{ id: string }>  };

const log = (message: string, data?: any) =>
  console.log(`[API:SERVICE-USERS/ADMIT] ${message}`, data ? JSON.stringify(data, null, 2) : '');

export async function POST(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const { id: serviceUserIdStr } = await params;
  const serviceUserId: number = parseInt(serviceUserIdStr, 10);

  if (isNaN(serviceUserId)) {
    log('Invalid service user ID', { serviceUserId });
    return NextResponse.json({ error: 'Invalid service user ID' }, { status: 400 });
  }

  try {
    const { wardId } = await req.json();
    log('Admitting service user', { serviceUserId, wardId });

    if (!wardId || !Number.isInteger(wardId)) {
      log('Invalid ward ID', { wardId });
      return NextResponse.json({ error: 'Valid ward ID is required' }, { status: 400 });
    }

    const admission = await prisma.admission.create({
      data: {
        serviceUserId,
        wardId,
        admissionDate: new Date(),
        dischargeDate: null,
        admittedById: userId,
      },
      include: { ward: true, serviceUser: true },
    });

    log('Admission created successfully', { id: admission.id });
    return NextResponse.json({
      ...admission,
      admissionDate: admission.admissionDate.toISOString(),
      dischargeDate: null,
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      log('Invalid foreign key', { serviceUserId });
    }
    log('Failed to create admission', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to create admission' }, { status: 500 });
  }
}
// src/app/api/service-users/[id]/admit/route.ts