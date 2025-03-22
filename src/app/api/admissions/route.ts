// app/api/admissions/route.ts
// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function GET() {
//   const admissions = await prisma.admission.findMany({
//     include: {
//       serviceUser: true,
//       ward: true,
//     },
//   });
//   return NextResponse.json(admissions);
// }

// export async function POST(request: Request) {
//   const { serviceUserId, wardId, admissionDate, dischargeDate } =
//     await request.json();

//   if (!serviceUserId || !wardId || !admissionDate) {
//     return NextResponse.json(
//       { error: 'Required fields are missing' },
//       { status: 400 },
//     );
//   }

//   const admission = await prisma.admission.create({
//     data: {
//       serviceUserId,
//       wardId,
//       admissionDate: new Date(admissionDate),
//       dischargeDate: dischargeDate ? new Date(dischargeDate) : null,
//     },
//   });

//   return NextResponse.json(admission, { status: 201 });
// }

// src/app/api/admissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ADMISSIONS] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const skip = (page - 1) * pageSize;
    const status = searchParams.get('status'); // 'active', 'discharged', or undefined

    const whereClause =
      status === 'active'
        ? { dischargeDate: null }
        : status === 'discharged'
          ? { dischargeDate: { not: null } }
          : {};

    log('Fetching admissions', { page, pageSize, status });
    const [admissions, total] = await Promise.all([
      prisma.admission.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { admissionDate: 'desc' },
        include: {
          serviceUser: true,
          ward: true,
          admittedBy: true,
          dischargedBy: true,
        },
      }),
      prisma.admission.count({ where: whereClause }),
    ]);

    const serialized = admissions.map((admission) => ({
      ...admission,
      admissionDate: admission.admissionDate.toISOString(),
      dischargeDate: admission.dischargeDate?.toISOString() || null,
    }));

    log('Admissions fetched successfully', { count: admissions.length });
    return NextResponse.json({ admissions: serialized, total, page, pageSize });
  } catch (error) {
    log('Failed to fetch admissions', error);
    return NextResponse.json(
      { error: 'Failed to fetch admissions' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = JSON.parse(userJson);
  const creatorId = user.id;

  try {
    const { serviceUserId, wardId, admissionDate } = await req.json();
    log('Creating admission', { serviceUserId, wardId, admissionDate });

    if (
      !Number.isInteger(serviceUserId) ||
      !Number.isInteger(wardId) ||
      !admissionDate
    ) {
      log('Invalid input');
      return NextResponse.json(
        { error: 'Service user ID, ward ID, and admission date are required' },
        { status: 400 },
      );
    }

    const admission = await prisma.admission.create({
      data: {
        serviceUserId,
        wardId,
        admissionDate: new Date(admissionDate),
        dischargeDate: null, // New admissions are active by default
        admittedById: creatorId,
      },
      include: { serviceUser: true, ward: true, admittedBy: true },
    });

    log('Admission created successfully', { id: admission.id });
    return NextResponse.json(
      {
        ...admission,
        admissionDate: admission.admissionDate.toISOString(),
        dischargeDate: admission.dischargeDate?.toISOString() || null,
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === 'P2003') {
      log('Invalid foreign key', { serviceUserId, wardId });
      return NextResponse.json(
        { error: 'Service user or ward not found' },
        { status: 404 },
      );
    }
    log('Failed to create admission', error);
    return NextResponse.json(
      { error: 'Failed to create admission' },
      { status: 500 },
    );
  }
}
