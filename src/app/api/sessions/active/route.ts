// src/app/api/sessions/active/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { SessionStatus, SessionType } from '@prisma/client';

const log = (message: string, data?: any) =>
  console.log(
    `[API:SESSIONS/ACTIVE] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as SessionType | undefined;
    const groupByGroupRef = searchParams.get('groupByGroupRef') === 'true';

    const whereClause = {
      status: SessionStatus.SCHEDULED,
      timeOut: null,
      ...(type ? { type } : {}),
    };

    log('Fetching active sessions', { type, groupByGroupRef });

    if (groupByGroupRef && type === SessionType.GROUP) {
      const groupedSessions = await prisma.session.groupBy({
        by: ['groupRef', 'groupDescription'],
        where: whereClause,
        _count: { _all: true },
      });

      const groupDetails = await Promise.all(
        groupedSessions.map(async (group) => {
          const sessions = await prisma.session.findMany({
            where: {
              groupRef: group.groupRef,
              status: SessionStatus.SCHEDULED,
              timeOut: null,
            },
            include: {
              facilitatedBy: true,
              activityLog: { include: { activity: true } },
              admission: { include: { serviceUser: true, ward: true } },
            },
          });

          return {
            groupRef: group.groupRef,
            groupDescription: group.groupDescription,
            count: group._count._all,
            sessions: sessions.map((session) => ({
              ...session,
              timeIn: session.timeIn.toISOString(),
              timeOut: session.timeOut?.toISOString() || null,
              createdAt: session.createdAt.toISOString(),
              updatedAt: session.updatedAt?.toISOString() || null,
              admission: {
                ...session.admission,
                admissionDate: session.admission.admissionDate.toISOString(),
                dischargeDate:
                  session.admission.dischargeDate?.toISOString() || null,
              },
            })),
          };
        }),
      );

      const total = groupDetails.reduce((sum, group) => sum + group.count, 0);

      log('Grouped group sessions fetched successfully', { total });
      return NextResponse.json({ groups: groupDetails, total });
    } else {
      const page = parseInt(searchParams.get('page') || '1', 10);
      const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
      const sortBy = searchParams.get('sortBy') || 'timeIn';
      const order = (searchParams.get('order') || 'asc') as 'asc' | 'desc';
      const skip = (page - 1) * pageSize;

      const [sessions, total] = await Promise.all([
        prisma.session.findMany({
          where: whereClause,
          skip,
          take: pageSize,
          orderBy: { [sortBy]: order },
          include: {
            facilitatedBy: true,
            activityLog: { include: { activity: true } },
            admission: { include: { serviceUser: true, ward: true } },
          },
        }),
        prisma.session.count({ where: whereClause }),
      ]);

      const serialized = sessions.map((session) => ({
        ...session,
        timeIn: session.timeIn.toISOString(),
        timeOut: session.timeOut?.toISOString() || null,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt?.toISOString() || null,
        admission: {
          ...session.admission,
          admissionDate: session.admission.admissionDate.toISOString(),
          dischargeDate: session.admission.dischargeDate?.toISOString() || null,
        },
      }));

      log('Active sessions fetched successfully', {
        count: sessions.length,
        total,
      });
      return NextResponse.json({ sessions: serialized, total, page, pageSize });
    }
  } catch (error: unknown) {
    log('Failed to fetch active sessions', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to fetch active sessions' },
      { status: 500 },
    );
  }
}
// src/app/api/sessions/active/route.ts
// remember that, I asked you to seperate the concerns no overloading of the route.ts file so I only need these files and they have been modified to work with the new schema
