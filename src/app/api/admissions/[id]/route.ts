// app/api/admissions/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const admission = await prisma.admission.findUnique({
    where: { id: parseInt(id) },
    include: { serviceUser: true, ward: true },
  });

  if (!admission) {
    return NextResponse.json({ error: 'Admission not found' }, { status: 404 });
  }

  return NextResponse.json(admission);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const { wardId, dischargeDate } = await request.json();

  const admission = await prisma.admission.update({
    where: { id: parseInt(id) },
    data: {
      wardId,
      dischargeDate: dischargeDate ? new Date(dischargeDate) : null,
    },
  });

  return NextResponse.json(admission);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.admission.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ message: 'Admission deleted' });
}
