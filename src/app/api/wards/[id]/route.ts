// src/app/api/wards/[id]/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// type Params = { params: { id: string } };

// const log = (message: string, data?: any) =>
//   console.log(
//     `[API:WARDS/ID] ${message}`,
//     data ? JSON.stringify(data, null, 2) : '',
//   );

// export async function GET(req: NextRequest, { params }: Params) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { id } = params;
//   const wardId = parseInt(id);

//   if (isNaN(wardId)) {
//     log('Invalid ward ID', { id });
//     return NextResponse.json({ error: 'Invalid ward ID' }, { status: 400 });
//   }

//   try {
//     log('Fetching ward', { id: wardId });
//     const ward = await prisma.ward.findUnique({
//       where: { id: wardId },
//       include: { admissions: { take: 5, orderBy: { admissionDate: 'desc' } } }, // Optional: include recent admissions for context
//     });

//     if (!ward) {
//       log('Ward not found', { id: wardId });
//       return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
//     }

//     log('Ward fetched successfully', { id: ward.id, name: ward.name });
//     return NextResponse.json(ward);
//   } catch (error) {
//     log('Failed to fetch ward', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch ward' },
//       { status: 500 },
//     );
//   }
// }

// export async function PUT(req: NextRequest, { params }: Params) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { id } = params;
//   const wardId = parseInt(id);

//   if (isNaN(wardId)) {
//     log('Invalid ward ID', { id });
//     return NextResponse.json({ error: 'Invalid ward ID' }, { status: 400 });
//   }

//   try {
//     const { name } = await req.json();
//     log('Updating ward', { id: wardId, name });

//     if (!name || typeof name !== 'string' || name.trim().length === 0) {
//       log('Invalid name provided');
//       return NextResponse.json(
//         { error: 'Name is required and must be a non-empty string' },
//         { status: 400 },
//       );
//     }

//     const ward = await prisma.ward.update({
//       where: { id: wardId },
//       data: { name: name.trim() },
//     });
//     log('Ward updated successfully', { id: ward.id, name: ward.name });
//     return NextResponse.json(ward);
//   } catch (error: any) {
//     if (error.code === 'P2002') {
//       log('Ward name already exists', { name });
//       return NextResponse.json(
//         { error: 'Ward name already exists' },
//         { status: 409 },
//       );
//     }
//     if (error.code === 'P2025') {
//       // Prisma record not found
//       log('Ward not found', { id: wardId });
//       return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
//     }
//     log('Failed to update ward', error);
//     return NextResponse.json(
//       { error: 'Failed to update ward' },
//       { status: 500 },
//     );
//   }
// }

// export async function DELETE(req: NextRequest, { params }: Params) {
//   const userJson = req.headers.get('x-supabase-user');
//   if (!userJson) {
//     log('Unauthorized access attempt');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { id } = params;
//   const wardId = parseInt(id);

//   if (isNaN(wardId)) {
//     log('Invalid ward ID', { id });
//     return NextResponse.json({ error: 'Invalid ward ID' }, { status: 400 });
//   }

//   try {
//     log('Deleting ward', { id: wardId });
//     await prisma.ward.delete({
//       where: { id: wardId },
//     });
//     log('Ward deleted successfully', { id: wardId });
//     return NextResponse.json({ message: 'Ward deleted successfully' });
//   } catch (error: any) {
//     if (error.code === 'P2025') {
//       log('Ward not found', { id: wardId });
//       return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
//     }
//     if (error.code === 'P2003') {
//       // Foreign key constraint violation
//       log('Ward cannot be deleted due to associated admissions', {
//         id: wardId,
//       });
//       return NextResponse.json(
//         {
//           error: 'Ward cannot be deleted because it has associated admissions',
//         },
//         { status: 409 },
//       );
//     }
//     log('Failed to delete ward', error);
//     return NextResponse.json(
//       { error: 'Failed to delete ward' },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/authMiddleware';

type Params = { params: { id: string } };

const log = (message: string, data?: any) =>
  console.log(`[API:WARDS/ID] ${message}`, data ? JSON.stringify(data, null, 2) : '');

export async function GET(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = params;
  const wardId = parseInt(id);

  if (isNaN(wardId)) {
    log('Invalid ward ID', { id });
    return NextResponse.json({ error: 'Invalid ward ID' }, { status: 400 });
  }

  try {
    const ward = await prisma.ward.findUnique({
      where: { id: wardId },
      include: { admissions: { take: 5, orderBy: { admissionDate: 'desc' } } },
    });

    if (!ward) {
      log('Ward not found', { id: wardId });
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }

    log('Ward fetched successfully', { id: ward.id, name: ward.name });
    return NextResponse.json(ward);
  } catch (error) {
    log('Failed to fetch ward', error);
    return NextResponse.json({ error: 'Failed to fetch ward' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = params;
  const wardId = parseInt(id);

  if (isNaN(wardId)) {
    log('Invalid ward ID', { id });
    return NextResponse.json({ error: 'Invalid ward ID' }, { status: 400 });
  }

  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      log('Invalid name provided');
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    const ward = await prisma.ward.update({
      where: { id: wardId },
      data: { name: name.trim() },
    });
    log('Ward updated successfully', { id: ward.id, name: ward.name });
    return NextResponse.json(ward);
  } catch (error: any) {
    if (error.code === 'P2002') {
      log('Ward name already exists', { name });
      return NextResponse.json({ error: 'Ward name already exists' }, { status: 409 });
    }
    if (error.code === 'P2025') {
      log('Ward not found', { id: wardId });
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }
    log('Failed to update ward', error);
    return NextResponse.json({ error: 'Failed to update ward' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const authResult = await authenticateRequest(req, 0, undefined, log);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = params;
  const wardId = parseInt(id);

  if (isNaN(wardId)) {
    log('Invalid ward ID', { id });
    return NextResponse.json({ error: 'Invalid ward ID' }, { status: 400 });
  }

  try {
    await prisma.ward.delete({
      where: { id: wardId },
    });
    log('Ward deleted successfully', { id: wardId });
    return NextResponse.json({ message: 'Ward deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      log('Ward not found', { id: wardId });
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }
    if (error.code === 'P2003') {
      log('Ward cannot be deleted due to associated admissions', { id: wardId });
      return NextResponse.json(
        { error: 'Ward cannot be deleted because it has associated admissions' },
        { status: 409 },
      );
    }
    log('Failed to delete ward', error);
    return NextResponse.json({ error: 'Failed to delete ward' }, { status: 500 });
  }
}