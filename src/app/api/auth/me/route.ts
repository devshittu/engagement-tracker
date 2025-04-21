// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

const log = (message: string, data?: any) =>
  console.log(
    `[API:AUTH/ME] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('sb-access-token')?.value;
    if (!token) {
      log('No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      log('Invalid token', { error: error?.message });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prismaProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    if (!prismaProfile) {
      log('No user profile found');
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 401 },
      );
    }

    const userProfile = {
      id: prismaProfile.id,
      name: prismaProfile.name,
      email: prismaProfile.email,
      departmentId: prismaProfile.departmentId,
      roles: prismaProfile.role
        ? [
            {
              id: prismaProfile.role.id,
              name: prismaProfile.role.name,
              level: prismaProfile.role.level,
            },
          ]
        : [],
    };

    log('User profile fetched', { userId: user.id });
    return NextResponse.json({ user: userProfile });
  } catch (error) {
    log('Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
