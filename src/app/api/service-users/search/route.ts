// src/app/api/service-users/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(`[API:SERVICE-USERS/SEARCH] ${message}`, data ? JSON.stringify(data, null, 2) : '');

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const query: string = searchParams.get('q') || '';
    const page: number = parseInt(searchParams.get('page') || '1', 10);
    const pageSize: number = parseInt(searchParams.get('pageSize') || '20', 10);
    const sortBy: string = searchParams.get('sortBy') || 'name';
    const order: 'asc' | 'desc' = (searchParams.get('order') || 'asc') as 'asc' | 'desc';
    const includeDischarged: boolean = searchParams.get('includeDischarged') === 'true';
    const skip: number = (page - 1) * pageSize;

    const whereClause: Prisma.ServiceUserWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { nhsNumber: { contains: query, mode: 'insensitive' as const } },
      ],
      admissions: includeDischarged ? {} : { some: { dischargeDate: null } },
    };

    log('Searching service users', { query, page, pageSize, includeDischarged });

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
      admissions: user.admissions.map((admission) => ({
        ...admission,
        admissionDate: admission.admissionDate.toISOString(),
        dischargeDate: admission.dischargeDate?.toISOString() || null,
      })),
    }));

    log('Search completed', { query, total: serialized.length });
    return NextResponse.json({
      serviceUsers: serialized,
      total,
      page,
      pageSize,
    });
  } catch (error: unknown) {
    log('Failed to search service users', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to search service users' }, { status: 500 });
  }
}
// src/app/api/service-users/search/route.ts
