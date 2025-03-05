// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const q = searchParams.get('q') || '';

//     if (!q) {
//       return NextResponse.json(
//         { error: "Query parameter 'q' is required" },
//         { status: 400 }
//       );
//     }

//     // Search service users by name or NHS number (case-insensitive)
//     const serviceUsers = await prisma.serviceUser.findMany({
//       where: {
//         OR: [
//           { name: { contains: q, mode: 'insensitive' } },
//           { nhsNumber: { contains: q, mode: 'insensitive' } },
//         ],
//       },
//       // Include the most recent admission with its ward
//       include: {
//         admissions: {
//           orderBy: { admissionDate: 'desc' },
//           take: 1,
//           include: { ward: true },
//         },
//       },
//     });

//     // Serialize dates to ISO strings
//     const serializedServiceUsers = serviceUsers.map((user) => ({
//       ...user,
//       createdAt: user.createdAt.toISOString(),
//       updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
//       admissions: user.admissions.map((adm) => ({
//         ...adm,
//         admissionDate: adm.admissionDate.toISOString(),
//         dischargeDate: adm.dischargeDate ? adm.dischargeDate.toISOString() : null,
//       })),
//     }));

//     return NextResponse.json({ serviceUsers: serializedServiceUsers });
//   } catch (error) {
//     console.error('Failed to search service users:', error);
//     return NextResponse.json(
//       { error: 'Failed to search service users' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const skip = (page - 1) * pageSize;

    // Validate query
    if (!q.trim()) {
      return NextResponse.json({ serviceUsers: [], total: 0, page, pageSize });
    }

    // Search service users by name or NHS number
    const [serviceUsers, total] = await Promise.all([
      prisma.serviceUser.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { nhsNumber: { contains: q, mode: 'insensitive' } },
          ],
        },
        skip,
        take: pageSize,
      }),
      prisma.serviceUser.count({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { nhsNumber: { contains: q, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    // Serialize dates (if any exist on serviceUser, e.g., createdAt)
    const serialized = serviceUsers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    }));

    return NextResponse.json({
      serviceUsers: serialized,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error searching service users:', error);
    return NextResponse.json(
      { error: 'Failed to search service users' },
      { status: 500 },
    );
  }
}
