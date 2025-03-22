// // src/app/api/users/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { supabase } from '@/lib/supabase';

// export async function GET() {
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//   const currentUser = await prisma.user.findUnique({
//     where: { id: user.id },
//     include: { role: true },
//   });

//   if (!currentUser || (currentUser.role.level < 4 && currentUser.role.name !== 'Super Admin')) {
//     return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
//   }

//   const users = await prisma.user.findMany({
//     include: { department: true, role: true },
//   });
//   return NextResponse.json(users);
// }

// export async function POST(req: NextRequest) {
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//   const currentUser = await prisma.user.findUnique({
//     where: { id: user.id },
//     include: { role: true, department: true },
//   });

//   if (!currentUser || (currentUser.role.level < 4 && currentUser.role.name !== 'Super Admin')) {
//     return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
//   }

//   const { email, departmentId, roleId } = await req.json();
//   if (!email || !Number.isInteger(departmentId) || !Number.isInteger(roleId)) {
//     return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
//   }

//   // Create user in Supabase Auth first
//   const { data: authData, error } = await supabase.auth.admin.createUser({
//     email,
//     password: 'defaultPassword123!', // Generate or prompt user to reset
//     email_confirm: true,
//   });
//   if (error) return NextResponse.json({ error: error.message }, { status: 400 });

//   const newUser = await prisma.user.create({
//     data: {
//       id: authData.user.id,
//       email,
//       departmentId,
//       roleId,
//       createdById: currentUser.id,
//     },
//     include: { department: true, role: true },
//   });

//   return NextResponse.json(newUser, { status: 201 });
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = JSON.parse(userJson);
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true },
  });

  if (
    !currentUser ||
    (currentUser.role.level < 4 && currentUser.role.name !== 'Super Admin')
  ) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 },
    );
  }

  const users = await prisma.user.findMany({
    include: { department: true, role: true },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const userJson = req.headers.get('x-supabase-user');
  if (!userJson) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = JSON.parse(userJson);
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true, department: true },
  });

  if (
    !currentUser ||
    (currentUser.role.level < 4 && currentUser.role.name !== 'Super Admin')
  ) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 },
    );
  }

  const { email, departmentId, roleId } = await req.json();
  if (!email || !Number.isInteger(departmentId) || !Number.isInteger(roleId)) {
    return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
  }

  const { data: authData, error } = await supabase.auth.admin.createUser({
    email,
    password: 'defaultPassword123!',
    email_confirm: true,
  });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  const newUser = await prisma.user.create({
    data: {
      id: authData.user.id,
      email,
      departmentId,
      roleId,
      createdById: currentUser.id,
    },
    include: { department: true, role: true },
  });

  return NextResponse.json(newUser, { status: 201 });
}
