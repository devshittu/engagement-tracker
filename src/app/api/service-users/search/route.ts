// src/app/api/serviceUsers/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const log = (message: string, data?: any) =>
  console.log(
    `[SERVICE-USERS:SEARCH] ${message}`,
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
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const sortBy = searchParams.get('sortBy') || 'name';
    const order = (searchParams.get('order') || 'asc') as 'asc' | 'desc';
    const includeDischarged = searchParams.get('includeDischarged') === 'true'; // New parameter

    const skip = (page - 1) * pageSize;

    const whereClause = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { nhsNumber: { contains: query, mode: 'insensitive' } },
      ],
      admissions: includeDischarged ? {} : { some: { dischargeDate: null } }, // Filter out discharged unless specified
    };

    log('Searching service users', {
      query,
      page,
      pageSize,
      includeDischarged,
    });
    const [serviceUsers, total] = await Promise.all([
      prisma.serviceUser.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: sortBy === 'name' ? { name: order } : { nhsNumber: order },
        include: {
          admissions: { include: { ward: true } },
        },
      }),
      prisma.serviceUser.count({ where: whereClause }),
    ]);

    const serialized = serviceUsers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString() || null,
      admissions: user.admissions.map((adm) => ({
        ...adm,
        admissionDate: adm.admissionDate.toISOString(),
        dischargeDate: adm.dischargeDate?.toISOString() || null,
      })),
    }));

    log('Search completed', { query, total: serialized.length });
    return NextResponse.json({
      serviceUsers: serialized,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    log('Failed to search service users', error);
    return NextResponse.json(
      { error: 'Failed to search service users' },
      { status: 500 },
    );
  }
}
// src/app/api/serviceUsers/search/route.ts
