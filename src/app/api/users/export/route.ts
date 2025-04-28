// src/app/api/users/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { logger } from '@/lib/logger';
import { stringify } from 'csv-stringify/sync';

const log = (message: string, data?: any) =>
  logger.info(`[API:USERS/EXPORT] ${message}`, data);

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 4); // Require admin level
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const users = await prisma.user.findMany({
      include: { role: true, department: true },
    });

    const csvData = users.map((user) => ({
      id: user.id,
      name: user.name || '',
      email: user.email,
      department: user.department.name,
      role: user.role.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString() || '',
    }));

    const csvString = stringify(csvData, {
      header: true,
      columns: [
        'id',
        'name',
        'email',
        'department',
        'role',
        'createdAt',
        'updatedAt',
      ],
    });

    log('Users exported', { userId, count: users.length });
    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=users_export.csv',
      },
    });
  } catch (error) {
    log('Error exporting users', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
// src/app/api/users/export/route.ts
