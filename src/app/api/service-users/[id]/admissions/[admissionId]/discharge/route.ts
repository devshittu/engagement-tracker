import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

type Params = { params: Promise<{ id: string; admissionId: string }> };

const log = (message: string, data?: any) =>
  console.log(
    `[API:SERVICE-USERS/ADMISSIONS/DISCHARGE] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function PUT(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;
  const { id: serviceUserIdStr, admissionId: admissionIdStr } = await params;
  const serviceUserId = parseInt(serviceUserIdStr, 10);
  const admissionId = parseInt(admissionIdStr, 10);

  if (isNaN(serviceUserId) || isNaN(admissionId)) {
    log('Invalid service user or admission ID', { serviceUserId, admissionId });
    return NextResponse.json(
      { error: 'Invalid service user or admission ID' },
      { status: 400 },
    );
  }

  try {
    log('Discharging service user', { serviceUserId, admissionId });

    const admission = await prisma.admission.findUnique({
      where: { id: admissionId, serviceUserId },
      include: { ward: true },
    });

    if (!admission) {
      log('Admission not found', { admissionId });
      return NextResponse.json(
        { error: 'Admission not found' },
        { status: 404 },
      );
    }

    if (admission.dischargeDate) {
      log('Admission already discharged', { admissionId });
      return NextResponse.json(
        { error: 'Admission already discharged' },
        { status: 400 },
      );
    }

    const updatedAdmission = await prisma.admission.update({
      where: { id: admissionId },
      data: {
        dischargeDate: new Date(),
        dischargedById: userId,
      },
      include: { ward: true, serviceUser: true },
    });

    log('Admission discharged successfully', { admissionId });
    return NextResponse.json({
      ...updatedAdmission,
      admissionDate: updatedAdmission.admissionDate.toISOString(),
      dischargeDate: updatedAdmission.dischargeDate?.toISOString() || null,
    });
  } catch (error: unknown) {
    log('Failed to discharge admission', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to discharge admission' },
      { status: 500 },
    );
  }
}
