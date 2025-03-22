// app/api/admissions/[id]/route.ts
// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// type Params = { params: Promise<{ id: string }> };

// export async function GET(request: Request, { params }: Params) {
//   const { id } = await params;
//   const admission = await prisma.admission.findUnique({
//     where: { id: parseInt(id) },
//     include: { serviceUser: true, ward: true },
//   });

//   if (!admission) {
//     return NextResponse.json({ error: 'Admission not found' }, { status: 404 });
//   }

//   return NextResponse.json(admission);
// }

// export async function PUT(request: Request, { params }: Params) {
//   const { id } = await params;
//   const { wardId, dischargeDate } = await request.json();

//   const admission = await prisma.admission.update({
//     where: { id: parseInt(id) },
//     data: {
//       wardId,
//       dischargeDate: dischargeDate ? new Date(dischargeDate) : null,
//     },
//   });

//   return NextResponse.json(admission);
// }

// export async function DELETE(request: Request, { params }: Params) {
//   const { id } = await params;
//   await prisma.admission.delete({ where: { id: parseInt(id) } });
//   return NextResponse.json({ message: 'Admission deleted' });
// }
// src/app/api/admissions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

const log = (message: string, data?: any) =>
  console.log(
    `[API:ADMISSIONS/ID] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest, { params }: Params) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const admissionId = parseInt(id);

  if (isNaN(admissionId)) {
    log('Invalid admission ID', { id });
    return NextResponse.json(
      { error: 'Invalid admission ID' },
      { status: 400 },
    );
  }

  try {
    log('Fetching admission', { id: admissionId });
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: {
        serviceUser: true,
        ward: true,
        admittedBy: true,
        dischargedBy: true,
      },
    });

    if (!admission) {
      log('Admission not found', { id: admissionId });
      return NextResponse.json(
        { error: 'Admission not found' },
        { status: 404 },
      );
    }

    log('Admission fetched successfully', { id: admission.id });
    return NextResponse.json({
      ...admission,
      admissionDate: admission.admissionDate.toISOString(),
      dischargeDate: admission.dischargeDate?.toISOString() || null,
    });
  } catch (error) {
    log('Failed to fetch admission', error);
    return NextResponse.json(
      { error: 'Failed to fetch admission' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = JSON.parse(userJson);
  const creatorId = user.id;
  const { id } = params;
  const admissionId = parseInt(id);

  if (isNaN(admissionId)) {
    log('Invalid admission ID', { id });
    return NextResponse.json(
      { error: 'Invalid admission ID' },
      { status: 400 },
    );
  }

  try {
    const { wardId, dischargeDate } = await req.json();
    log('Updating admission', { id: admissionId, wardId, dischargeDate });

    const updateData: any = {};
    if (wardId !== undefined) {
      if (!Number.isInteger(wardId)) {
        log('Invalid ward ID');
        return NextResponse.json({ error: 'Invalid ward ID' }, { status: 400 });
      }
      updateData.wardId = wardId;
    }
    if (dischargeDate !== undefined) {
      updateData.dischargeDate = dischargeDate ? new Date(dischargeDate) : null;
      updateData.dischargedById = dischargeDate ? creatorId : null;
    }

    const admission = await prisma.admission.update({
      where: { id: admissionId },
      data: updateData,
      include: {
        serviceUser: true,
        ward: true,
        admittedBy: true,
        dischargedBy: true,
      },
    });

    log('Admission updated successfully', { id: admission.id });
    return NextResponse.json({
      ...admission,
      admissionDate: admission.admissionDate.toISOString(),
      dischargeDate: admission.dischargeDate?.toISOString() || null,
    });
  } catch (error: any) {
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
    log('Failed to update admission', error);
    return NextResponse.json(
      { error: 'Failed to update admission' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const admissionId = parseInt(id);

  if (isNaN(admissionId)) {
    log('Invalid admission ID', { id });
    return NextResponse.json(
      { error: 'Invalid admission ID' },
      { status: 400 },
    );
  }

  try {
    log('Deleting admission', { id: admissionId });
    await prisma.admission.delete({
      where: { id: admissionId },
    });
    log('Admission deleted successfully', { id: admissionId });
    return NextResponse.json({ message: 'Admission deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      log('Admission not found', { id: admissionId });
      return NextResponse.json(
        { error: 'Admission not found' },
        { status: 404 },
      );
    }
    if (error.code === 'P2003') {
      log('Admission has associated sessions', { id: admissionId });
      return NextResponse.json(
        { error: 'Cannot delete admission with associated sessions' },
        { status: 409 },
      );
    }
    log('Failed to delete admission', error);
    return NextResponse.json(
      { error: 'Failed to delete admission' },
      { status: 500 },
    );
  }
}
