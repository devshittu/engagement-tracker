import { ServiceUser } from '@/types/serviceUser';
// src/app/api/service-users/[id]/admissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/reportUtils';

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('SERVICE-USERS:ADMISSIONS', 'Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: ServiceUserId } = params;
  const id = parseInt(ServiceUserId);
  if (isNaN(id)) {
    log('SERVICE-USERS:ADMISSIONS', 'Invalid serviceUserId', { id });
    return NextResponse.json(
      { error: 'Invalid serviceUserId' },
      { status: 400 },
    );
  }

  try {
    log('SERVICE-USERS:ADMISSIONS', 'Fetching admissions', { id });

    const admissions = await prisma.admission.findMany({
      where: { serviceUserId: id },
      include: {
        ward: true,
        admittedBy: { select: { email: true } },
        dischargedBy: { select: { email: true } },
      },
      orderBy: { admissionDate: 'desc' },
    });

    if (admissions.length === 0) {
      log('SERVICE-USERS:ADMISSIONS', 'No admissions found', { id });
      return NextResponse.json(
        { error: 'No admissions found' },
        { status: 404 },
      );
    }

    const response = {
      serviceUserId: id,
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

    log('SERVICE-USERS:ADMISSIONS', 'Admissions fetched', {
      id,
      count: admissions.length,
    });
    return NextResponse.json(response);
  } catch (error) {
    log('SERVICE-USERS:ADMISSIONS', 'Failed to fetch admissions', error);
    return NextResponse.json(
      { error: 'Failed to fetch admissions' },
      { status: 500 },
    );
  }
}

// src/app/api/service-users/[id]/admissions/route.ts

// Description: Retrieves all admission records for a service user, including ward and staff details.
