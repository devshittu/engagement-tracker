// src/app/api/admissions/active/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ADMISSIONS/ACTIVE] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4
  const authResult = await authenticateRequest(req, 4, undefined, (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  try {
    log('Fetching active admissions');
    const activeAdmissions = await prisma.admission.findMany({
      where: {
        dischargeDate: null,
      },
      include: { serviceUser: true, ward: true },
    });

    log('Active admissions fetched successfully', { count: activeAdmissions.length });
    return NextResponse.json(activeAdmissions);
  } catch (error: unknown) {
    log('Failed to fetch active admissions', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch active admissions' },
      { status: 500 },
    );
  }
}
// src/app/api/admissions/active/route.ts
