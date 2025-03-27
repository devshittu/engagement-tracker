// src/app/api/reports/service-users/[serviceUserId]/engagement/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { format, subYears } from 'date-fns';

// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ serviceUserId: string }> },
// ) {
//   const { serviceUserId } = await context.params;
//   const id = parseInt(serviceUserId);

//   const { searchParams } = new URL(req.url);
//   const admissionId = searchParams.get('admissionId');
//   const period = searchParams.get('period') || 'week';

//   const serviceUser = await prisma.serviceUser.findUnique({
//     where: { id },
//     select: { name: true, nhsNumber: true },
//   });

//   if (!serviceUser) {
//     return NextResponse.json(
//       { error: 'Service user not found' },
//       { status: 404 },
//     );
//   }

//   const admissionWhere = admissionId
//     ? { id: parseInt(admissionId), serviceUserId: id }
//     : { serviceUserId: id };

//   const admissions = await prisma.admission.findMany({
//     where: admissionWhere,
//     include: {
//       ward: { select: { name: true } },
//       sessions: {
//         include: {
//           activityLog: { include: { activity: { select: { name: true } } } },
//         },
//         where: { timeIn: { gte: subYears(new Date(), 2) } },
//         orderBy: { timeIn: 'asc' },
//       },
//     },
//   });

//   if (admissions.length === 0) {
//     return NextResponse.json({ error: 'No admissions found' }, { status: 404 });
//   }

//   const allSessions = admissions.flatMap((admission) => admission.sessions);
//   const engagement = allSessions.map((session) => {
//     let dateFormat =
//       period === 'week'
//         ? 'yyyy-ww'
//         : period === 'month'
//           ? 'yyyy-MM'
//           : 'yyyy-MM-dd';
//     return { date: format(session.timeIn, dateFormat), sessionCount: 1 };
//   });

//   const groupedEngagement = engagement.reduce(
//     (acc, curr) => {
//       acc[curr.date] = acc[curr.date] || { date: curr.date, sessionCount: 0 };
//       acc[curr.date].sessionCount += curr.sessionCount;
//       return acc;
//     },
//     {} as Record<string, { date: string; sessionCount: number }>,
//   );

//   const data = Object.values(groupedEngagement).sort((a, b) =>
//     a.date.localeCompare(b.date),
//   );
//   const totalSessions = data.reduce((sum, d) => sum + d.sessionCount, 0);
//   const averageSessionsPerPeriod = totalSessions / (data.length || 1);

//   let activities: string[] = [];
//   let wardDetails: {
//     name: string;
//     admissionDate: string;
//     dischargeDate: string | null;
//   } | null = null;

//   if (admissionId) {
//     const admission = admissions[0];
//     activities = [
//       ...new Set(admission.sessions.map((s) => s.activityLog.activity.name)),
//     ];
//     wardDetails = {
//       name: admission.ward.name,
//       admissionDate: admission.admissionDate.toISOString(),
//       dischargeDate: admission.dischargeDate?.toISOString() || null,
//     };
//   } else {
//     const allActivities = admissions.flatMap((admission) =>
//       admission.sessions.map((s) => s.activityLog.activity.name),
//     );
//     activities = [...new Set(allActivities)];
//   }

//   const response = {
//     serviceUser: {
//       id,
//       name: serviceUser.name,
//       nhsNumber: serviceUser.nhsNumber,
//     },
//     wardDetails: admissionId ? wardDetails : undefined,
//     activities,
//     period,
//     data,
//     totalSessions,
//     averageSessionsPerPeriod,
//     admissionId: admissionId || undefined,
//   };

//   return NextResponse.json(response);
// }
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';
import { format, subYears } from 'date-fns';

const log = (message: string, data?: any) =>
  console.log(
    `[REPORTS:SERVICE-USERS:ENGAGEMENT] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ serviceUserId: string }> },
) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { serviceUserId } = await context.params;
  const id = parseInt(serviceUserId);

  const { searchParams } = new URL(req.url);
  const admissionId = searchParams.get('admissionId');
  const period = searchParams.get('period') || 'week';

  const serviceUser = await prisma.serviceUser.findUnique({
    where: { id },
    select: { name: true, nhsNumber: true },
  });

  if (!serviceUser) {
    log('Service user not found', { serviceUserId });
    return NextResponse.json(
      { error: 'Service user not found' },
      { status: 404 },
    );
  }

  const admissionWhere = admissionId
    ? { id: parseInt(admissionId), serviceUserId: id }
    : { serviceUserId: id };

  const admissions = await prisma.admission.findMany({
    where: admissionWhere,
    include: {
      ward: { select: { name: true } },
      sessions: {
        include: {
          activityLog: { include: { activity: { select: { name: true } } } },
        },
        where: { timeIn: { gte: subYears(new Date(), 2) } },
        orderBy: { timeIn: 'asc' },
      },
    },
  });

  if (admissions.length === 0) {
    log('No admissions found', { serviceUserId });
    return NextResponse.json({ error: 'No admissions found' }, { status: 404 });
  }

  const allSessions = admissions.flatMap((admission) => admission.sessions);
  const engagement = allSessions.map((session) => {
    let dateFormat =
      period === 'week'
        ? 'yyyy-ww'
        : period === 'month'
        ? 'yyyy-MM'
        : 'yyyy-MM-dd';
    return { date: format(session.timeIn, dateFormat), sessionCount: 1 };
  });

  const groupedEngagement = engagement.reduce(
    (acc, curr) => {
      acc[curr.date] = acc[curr.date] || { date: curr.date, sessionCount: 0 };
      acc[curr.date].sessionCount += curr.sessionCount;
      return acc;
    },
    {} as Record<string, { date: string; sessionCount: number }>,
  );

  const data = Object.values(groupedEngagement).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const totalSessions = data.reduce((sum, d) => sum + d.sessionCount, 0);
  const averageSessionsPerPeriod = totalSessions / (data.length || 1);

  let activities: string[] = [];
  let wardDetails: {
    name: string;
    admissionDate: string;
    dischargeDate: string | null;
  } | null = null;

  if (admissionId) {
    const admission = admissions[0];
    activities = [
      ...new Set(admission.sessions.map((s) => s.activityLog.activity.name)),
    ];
    wardDetails = {
      name: admission.ward.name,
      admissionDate: admission.admissionDate.toISOString(),
      dischargeDate: admission.dischargeDate?.toISOString() || null,
    };
  } else {
    const allActivities = admissions.flatMap((admission) =>
      admission.sessions.map((s) => s.activityLog.activity.name),
    );
    activities = [...new Set(allActivities)];
  }

  const response = {
    serviceUser: {
      id,
      name: serviceUser.name,
      nhsNumber: serviceUser.nhsNumber,
    },
    wardDetails: admissionId ? wardDetails : undefined,
    activities,
    period,
    data,
    totalSessions,
    averageSessionsPerPeriod,
    admissionId: admissionId || undefined,
  };

  log('Engagement data fetched', { serviceUserId });
  return NextResponse.json(response);
}
// Description: Tracks a service user’s session participation from admission to discharge, showing group vs. one-to-one sessions over time.
// Notes:
// Data: Provides daily engagement points for a Stacked Area Chart (group vs. one-to-one over time).
// Includes: Full session details with activity and facilitator info.
// Auth: Requires x-supabase-user.
