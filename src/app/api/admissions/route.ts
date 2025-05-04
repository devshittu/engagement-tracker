// src/app/api/admissions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ADMISSIONS] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 4, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  try {
    log('Fetching all admissions');
    const admissions = await prisma.admission.findMany({
      include: { serviceUser: true, ward: true },
    });

    log('Admissions fetched successfully', { count: admissions.length });
    return NextResponse.json(admissions);
  } catch (error: unknown) {
    log('Failed to fetch admissions', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch admissions' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req, 4, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;

  // Initialize variables to avoid undefined errors
  let wardId: number | undefined = undefined;
  try {
    const { serviceUser: serviceUserData, wardId } = await req.json();
    const { nhsNumber, name } = serviceUserData || {};
    // wardId = wId;

    log('Creating admission', { nhsNumber, wardId });

    if (!nhsNumber || !Number.isInteger(wardId)) {
      log('Invalid admission data');
      return NextResponse.json(
        { error: 'NHS number and ward ID are required' },
        { status: 400 },
      );
    }

    let serviceUser = await prisma.serviceUser.findUnique({
      where: { nhsNumber },
    });

    if (!serviceUser) {
      serviceUser = await prisma.serviceUser.create({
        data: {
          name: name || 'Unnamed User',
          nhsNumber,
          createdById: userId,
        },
      });
      log('New service user created for admission', { id: serviceUser.id });
    }

    const admission = await prisma.admission.create({
      data: {
        serviceUserId: serviceUser.id,
        wardId,
        admittedById: userId,
        admissionDate: new Date(),
      },
      include: { serviceUser: true, ward: true },
    });

    log('Admission created successfully', { id: admission.id });
    return NextResponse.json(admission, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        log('Invalid service user or ward ID', { wardId });
        return NextResponse.json(
          { error: 'Service user or ward not found' },
          { status: 404 },
        );
      }
    }
    log('Failed to create admission', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to create admission' },
      { status: 500 },
    );
  }
}
// app/api/admissions/route.ts
