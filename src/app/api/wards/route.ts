// src/app/api/wards/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// const log = (message: string, data?: any) =>
//   console.log(
//     `[API:WARDS] ${message}`,
//     data ? JSON.stringify(data, null, 2) : '',
//   );

// export async function GET(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     log('Fetching all wards');
//     const wards = await prisma.ward.findMany({
//       orderBy: { id: 'asc' }, // Scalable default sorting
//     });
//     log('Wards fetched successfully', { count: wards.length });
//     return NextResponse.json(wards);
//   } catch (error) {
//     log('Failed to fetch wards', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch wards' },
//       { status: 500 },
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const { name } = await req.json();
//     log('Creating new ward', { name });

//     if (!name || typeof name !== 'string' || name.trim().length === 0) {
//       log('Invalid name provided');
//       return NextResponse.json(
//         { error: 'Name is required and must be a non-empty string' },
//         { status: 400 },
//       );
//     }

//     const ward = await prisma.ward.create({
//       data: { name: name.trim() },
//     });
//     log('Ward created successfully', { id: ward.id, name: ward.name });
//     return NextResponse.json(ward, { status: 201 });
//   } catch (error: any) {
//     if (error.code === 'P2002') {
//       // Prisma unique constraint violation
//       log('Ward name already exists', { name });
//       return NextResponse.json(
//         { error: 'Ward name already exists' },
//         { status: 409 },
//       );
//     }
//     log('Failed to create ward', error);
//     return NextResponse.json(
//       { error: 'Failed to create ward' },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';

const log = (message: string, data?: any) =>
  console.log(`[API:WARDS] ${message}`, data ? JSON.stringify(data, null, 2) : '');

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const wards = await prisma.ward.findMany({
      orderBy: { id: 'asc' },
    });
    log('Wards fetched successfully', { count: wards.length });
    return NextResponse.json(wards);
  } catch (error) {
    log('Failed to fetch wards', error);
    return NextResponse.json({ error: 'Failed to fetch wards' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      log('Invalid name provided');
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    const ward = await prisma.ward.create({
      data: { name: name.trim() },
    });
    log('Ward created successfully', { id: ward.id, name: ward.name });
    return NextResponse.json(ward, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      log('Ward name already exists', { name });
      return NextResponse.json({ error: 'Ward name already exists' }, { status: 409 });
    }
    log('Failed to create ward', error);
    return NextResponse.json({ error: 'Failed to create ward' }, { status: 500 });
  }
}
// src/app/api/wards/route.ts