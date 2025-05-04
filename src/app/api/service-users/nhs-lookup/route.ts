// src/app/api/service-users/nhs-lookup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, logger.info);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const nhsNumber: string = searchParams.get('nhsNumber') || '';

    if (!nhsNumber) {
      logger.warn('NHS number not provided in request');
      return NextResponse.json({ serviceUsers: [] }, { status: 200 });
    }

    logger.info('Searching service users by NHS number', { nhsNumber });

    const serviceUsers = await prisma.serviceUser.findMany({
      where: {
        nhsNumber: { contains: nhsNumber, mode: 'insensitive' as const },
      },
      include: {
        admissions: {
          orderBy: { admissionDate: 'desc' },
          take: 1,
        },
      },
      take: 5,
    });

    const serialized = serviceUsers.map((user) => ({
      id: user.id,
      name: user.name,
      nhsNumber: user.nhsNumber,
      admissionStatus:
        user.admissions.length > 0
          ? user.admissions[0].dischargeDate
            ? 'discharged'
            : 'admitted'
          : 'neverAdmitted',
      latestAdmission:
        user.admissions.length > 0
          ? {
              admissionDate: user.admissions[0].admissionDate.toISOString(),
              dischargeDate:
                user.admissions[0].dischargeDate?.toISOString() || null,
            }
          : null,
    }));

    logger.info('NHS lookup completed', { matches: serialized.length });
    return NextResponse.json({ serviceUsers: serialized });
  } catch (error: unknown) {
    logger.error('Failed to search service users by NHS number', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to search service users by NHS number' },
      { status: 500 },
    );
  }
}

// src/app/api/service-users/nhs-lookup/route.ts
