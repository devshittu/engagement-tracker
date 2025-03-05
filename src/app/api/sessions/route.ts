import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Pagination
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const skip = (page - 1) * pageSize;

  // 2. Sorting & Potential Grouping
  const sortBy = searchParams.get('sortBy') || 'timeIn';
  const order = (searchParams.get('order') || 'asc') as 'asc' | 'desc';
  const groupBy = searchParams.get('groupBy'); // e.g., "timeIn"

  // Allowed scalar fields for groupBy
  const allowedFields: Prisma.SessionScalarFieldEnum[] = [
    'id',
    'admissionId',
    'activityId',
    'timeIn',
    'timeOut',
  ];

  // Validate groupBy
  if (
    groupBy &&
    !allowedFields.includes(groupBy as Prisma.SessionScalarFieldEnum)
  ) {
    return NextResponse.json(
      { error: `Invalid groupBy: ${groupBy}` },
      { status: 400 },
    );
  }

  // Build orderBy logic
  let orderByClause: Prisma.SessionOrderByWithRelationInput = {};
  switch (sortBy) {
    case 'timeIn':
      orderByClause = { timeIn: order };
      break;
    case 'activityName':
      orderByClause = { activity: { name: order } };
      break;
    case 'serviceUserName':
      orderByClause = { admission: { serviceUser: { name: order } } };
      break;
    default:
      orderByClause = { timeIn: order };
      break;
  }

  try {
    if (groupBy) {
      // 3. groupBy approach
      // @ts-ignore
      const aggregator = await prisma.session.groupBy({
        by: [groupBy as Prisma.SessionScalarFieldEnum],
        _count: { _all: true },
        orderBy: [{ [groupBy]: order }], // Ensure orderBy fields are also in by
        skip,
        take: pageSize,
      });

      // Return aggregator array as shape => { groupedData, pageParam }
      // @ts-ignore
      const groupedData = aggregator.map((item) => ({
        ...item,
      }));

      return NextResponse.json({
        groupedData,
        pageParam: page,
      });
    }

    // 4. Normal approach => findMany
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        skip,
        take: pageSize,
        orderBy: orderByClause,
        include: {
          admission: {
            include: {
              serviceUser: true,
              ward: true,
            },
          },
          activity: true,
        },
      }),
      prisma.session.count(),
    ]);

    // Return a SessionsResponse shape
    return NextResponse.json({
      sessions,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const data = await request.json();
  const { admissionId, activityId } = data;

  if (!admissionId || !activityId) {
    return NextResponse.json(
      { error: 'Missing admissionId or activityId' },
      { status: 400 },
    );
  }

  try {
    // Ensure the admission exists and is active
    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: { serviceUser: true },
    });

    if (!admission || admission.dischargeDate) {
      return NextResponse.json(
        { error: 'Invalid or inactive admission' },
        { status: 400 },
      );
    }

    // Create the session
    const session = await prisma.session.create({
      data: {
        admissionId,
        activityId,
        timeIn: new Date(),
      },
      include: {
        admission: {
          include: {
            serviceUser: true,
          },
        },
        activity: true,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 },
    );
  }
}

// Additional methods (PUT, DELETE) can be added as needed
// src/app/api/sessions/route.ts
