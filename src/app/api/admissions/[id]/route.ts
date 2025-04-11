// src/app/api/admissions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ADMISSIONS/ID] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Await the Promise
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4
  const authResult = await authenticateRequest(req, 4, undefined, (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const admissionId = parseInt(id);

  if (isNaN(admissionId)) {
    log('Invalid admission ID', { id });
    return NextResponse.json({ error: 'Invalid admission ID' }, { status: 400 });
  }

  try {
    log('Fetching admission', { id: admissionId });
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: { serviceUser: true, ward: true },
    });

    if (!admission) {
      log('Admission not found', { id: admissionId });
      return NextResponse.json({ error: 'Admission not found' }, { status: 404 });
    }

    log('Admission fetched successfully', { id: admission.id });
    return NextResponse.json(admission);
  } catch (error: unknown) {
    log('Failed to fetch admission', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch admission' },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Await the Promise
  // Step 1: Use authenticateRequest with requiredRoleLevel: 4
  const authResult = await authenticateRequest(req, 4, undefined, (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const admissionId = parseInt(id);

  if (isNaN(admissionId)) {
    log('Invalid admission ID', { id });
    return NextResponse.json({ error: 'Invalid admission ID' }, { status: 400 });
  }

  // Initialize variables to avoid undefined errors
  let wardId: number | undefined = undefined;
  let dischargeDate: string | undefined = undefined;

  try {
    const { wardId: wId, dischargeDate: dDate } = await req.json();
    wardId = wId;
    dischargeDate = dDate;

    log('Updating admission', { id: admissionId, wardId, dischargeDate });

    if (typeof wardId === 'undefined' || !Number.isInteger(wardId)) {
      log('Invalid ward ID');
      return NextResponse.json({ error: 'Invalid ward ID' }, { status: 400 });
    }

    const data: { wardId: number; dischargeDate?: Date; updatedAt: Date } = {
      wardId,
      updatedAt: new Date(),
    };
    if (dischargeDate) {
      data.dischargeDate = new Date(dischargeDate);
    }

    const admission = await prisma.admission.update({
      where: { id: admissionId },
      data,
      include: { serviceUser: true, ward: true },
    });

    log('Admission updated successfully', { id: admission.id });
    return NextResponse.json(admission);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log('Admission not found', { id: admissionId });
        return NextResponse.json(
          { error: 'Admission not found' },
          { status: 404 },
        );
      }
      if (error.code === 'P2003') {
        log('Invalid ward ID', { wardId });
        return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
      }
    }
    log('Failed to update admission', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to update admission' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // Await the Promise
  // Step 1: Use authenticateRequest with requiredRoleName: 'Super Admin'
  const authResult = await authenticateRequest(req, 0, 'Super Admin', (message, data) =>
    log(message, data),
  );
  if (authResult instanceof NextResponse) return authResult;

  const admissionId = parseInt(id);

  if (isNaN(admissionId)) {
    log('Invalid admission ID', { id });
    return NextResponse.json({ error: 'Invalid admission ID' }, { status: 400 });
  }

  try {
    log('Deleting admission', { id: admissionId });
    await prisma.admission.delete({
      where: { id: admissionId },
    });

    log('Admission deleted successfully', { id: admissionId });
    return NextResponse.json({ message: 'Admission deleted' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log('Admission not found', { id: admissionId });
        return NextResponse.json(
          { error: 'Admission not found' },
          { status: 404 },
        );
      }
      if (error.code === 'P2003') {
        log('Admission cannot be deleted due to associated records', { id: admissionId });
        return NextResponse.json(
          { error: 'Admission cannot be deleted due to associated records' },
          { status: 409 },
        );
      }
    }
    log('Failed to delete admission', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to delete admission' },
      { status: 500 },
    );
  }
}
// app/api/admissions/[id]/route.ts
