// src/app/api/service-users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { Prisma } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(
    `[API:SERVICE-USERS] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const page: number = parseInt(searchParams.get('page') || '1', 10);
  const pageSize: number = parseInt(searchParams.get('pageSize') || '20', 10);
  const status: 'admitted' | 'discharged' | 'all' =
    (searchParams.get('status') as 'admitted' | 'discharged' | 'all') || 'all';
  const sortBy: string = searchParams.get('sortBy') || 'name';
  const order: 'asc' | 'desc' =
    searchParams.get('order') === 'desc' ? 'desc' : 'asc';
  const groupByWard: boolean = searchParams.get('groupByWard') === 'true';
  const skip: number = (page - 1) * pageSize;

  try {
    log('Fetching service users', { page, status });

    const whereClause: Prisma.ServiceUserWhereInput = {};
    if (status !== 'all') {
      whereClause.admissions = {
        some: {
          dischargeDate: status === 'admitted' ? null : { not: null },
        },
      };
    }

    const serviceUsers = await prisma.serviceUser.findMany({
      where: whereClause,
      include: {
        admissions: {
          include: { ward: true },
          orderBy: { admissionDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { [sortBy]: order },
      skip,
      take: pageSize,
    });

    const total = await prisma.serviceUser.count({ where: whereClause });

    let responseData: any;
    if (groupByWard) {
      const grouped = serviceUsers.reduce(
        (acc: { [wardName: string]: any[] }, user) => {
          const wardName = user.admissions[0]?.ward?.name || 'No Ward';
          acc[wardName] = acc[wardName] || [];
          acc[wardName].push({
            ...user,
            admissions: user.admissions.map((admission) => ({
              ...admission,
              admissionDate: admission.admissionDate.toISOString(),
              dischargeDate: admission.dischargeDate?.toISOString() || null,
            })),
          });
          return acc;
        },
        {},
      );
      responseData = { serviceUsers: grouped, total, page, pageSize };
    } else {
      responseData = {
        serviceUsers: serviceUsers.map((user) => ({
          ...user,
          admissions: user.admissions.map((admission) => ({
            ...admission,
            admissionDate: admission.admissionDate.toISOString(),
            dischargeDate: admission.dischargeDate?.toISOString() || null,
          })),
        })),
        total,
        page,
        pageSize,
      };
    }

    log('Service users fetched successfully', {
      count: serviceUsers.length,
      total,
    });
    return NextResponse.json(responseData);
  } catch (error: unknown) {
    log('Failed to fetch service users', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch service users' },
      { status: 500 },
    );
  }
}
// src/app/api/service-users/route.ts
