// app/api/admissions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const admissions = await prisma.admission.findMany({
    include: {
      serviceUser: true,
      ward: true,
    },
  });
  return NextResponse.json(admissions);
}

export async function POST(request: Request) {
  const { serviceUserId, wardId, admissionDate, dischargeDate } =
    await request.json();

  if (!serviceUserId || !wardId || !admissionDate) {
    return NextResponse.json(
      { error: 'Required fields are missing' },
      { status: 400 },
    );
  }

  const admission = await prisma.admission.create({
    data: {
      serviceUserId,
      wardId,
      admissionDate: new Date(admissionDate),
      dischargeDate: dischargeDate ? new Date(dischargeDate) : null,
    },
  });

  return NextResponse.json(admission, { status: 201 });
}
