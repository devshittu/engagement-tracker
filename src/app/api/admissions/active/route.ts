import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const userIdParam = searchParams.get('userId');

//     if (!userIdParam) {
//       return NextResponse.json(
//         { error: 'Missing userId' },
//         { status: 400 }
//       );
//     }

//     const userId = parseInt(userIdParam, 10);
//     if (isNaN(userId)) {
//       return NextResponse.json(
//         { error: 'Invalid userId' },
//         { status: 400 }
//       );
//     }

//     // Find the latest active admission for this user
//     const admission = await prisma.admission.findFirst({
//       where: {
//         serviceUserId: userId,
//         dischargeDate: null, // still active
//       },
//       orderBy: {
//         admissionDate: 'desc',
//       },
//       include: {
//         ward: true,
//         serviceUser: true,
//       },
//     });

//     return NextResponse.json({ admission });
//   } catch (error) {
//     console.error('Failed to fetch active admission:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch active admission' },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/admissions/active/route.ts

export async function GET() {
  try {
    // Only active admissions (dischargeDate is null)
    const admissions = await prisma.admission.findMany({
      where: { dischargeDate: null },
      include: { serviceUser: true },
    });
    return NextResponse.json(admissions);
  } catch (error) {
    console.error('Failed to fetch admissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admissions' },
      { status: 500 },
    );
  }
}
