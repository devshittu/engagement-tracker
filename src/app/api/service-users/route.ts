// src/app/api/serviceUsers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/reportUtils';
import { ServiceUsersResponse } from '@/types/serviceUser';

export async function GET(req: NextRequest) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    log('SERVICE-USERS:LIST', 'Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const status =
    (searchParams.get('status') as 'admitted' | 'discharged' | 'all') || 'all';
  const sortBy = searchParams.get('sortBy') || 'name';
  const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc';
  const groupByWard = searchParams.get('groupByWard') === 'true';

  try {
    log('SERVICE-USERS:LIST', 'Fetching service users', { page, status });

    const skip = (page - 1) * pageSize;

    const whereClause: any = {};
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
          take: 1, // Only latest admission for status check
        },
      },
      orderBy: { [sortBy]: order },
      skip,
      take: pageSize,
    });

    const total = await prisma.serviceUser.count({ where: whereClause });

    let responseData: ServiceUsersResponse;
    if (groupByWard) {
      const grouped = serviceUsers.reduce(
        (acc, user) => {
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
        {} as { [wardName: string]: ServiceUser[] },
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

    return NextResponse.json(responseData);
  } catch (error) {
    log('SERVICE-USERS:LIST', 'Failed to fetch service users', error);
    return NextResponse.json(
      { error: 'Failed to fetch service users' },
      { status: 500 },
    );
  }
}
