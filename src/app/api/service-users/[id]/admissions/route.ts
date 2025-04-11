// src/app/api/service-users/[id]/admissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

type Params = { params: Promise<{ id: string }>  };

const log = (message: string, data?: any) =>
  console.log(`[API:SERVICE-USERS/ADMISSIONS] ${message}`, data ? JSON.stringify(data, null, 2) : '');

export async function GET(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { id: serviceUserIdStr } =  await params;
  const serviceUserId: number = parseInt(serviceUserIdStr, 10);

  if (isNaN(serviceUserId)) {
    log('Invalid serviceUserId', { serviceUserId });
    return NextResponse.json({ error: 'Invalid serviceUserId' }, { status: 400 });
  }

  try {
    log('Fetching admissions', { serviceUserId });

    const admissions = await prisma.admission.findMany({
      where: { serviceUserId },
      include: {
        ward: true,
        admittedBy: { select: { email: true } },
        dischargedBy: { select: { email: true } },
      },
      orderBy: { admissionDate: 'desc' },
    });

    if (admissions.length === 0) {
      log('No admissions found', { serviceUserId });
      return NextResponse.json({ error: 'No admissions found' }, { status: 404 });
    }

    const response = {
      serviceUserId,
      admissions: admissions.map((admission) => ({
        id: admission.id,
        admissionDate: admission.admissionDate.toISOString(),
        dischargeDate: admission.dischargeDate?.toISOString() || null,
        status: admission.dischargeDate ? 'discharged' : 'admitted',
        ward: admission.ward.name,
        admittedBy: admission.admittedBy.email,
        dischargedBy: admission.dischargedBy?.email || null,
      })),
    };

    log('Admissions fetched', { serviceUserId, count: admissions.length });
    return NextResponse.json(response);
  } catch (error: unknown) {
    log('Failed to fetch admissions', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to fetch admissions' }, { status: 500 });
  }
}

// src/app/api/service-users/[id]/admissions/route.ts

// Description: Retrieves all admission records for a service user, including ward and staff details.
