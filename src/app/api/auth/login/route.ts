// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

const log = (message: string, data?: any) =>
  console.log(
    `[API:AUTH/LOGIN] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    log('Attempting login', { email });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      log('Login failed', { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const { user, session } = data;
    if (!session?.access_token) {
      log('No access token returned');
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 },
      );
    }

    const prismaProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    if (!prismaProfile) {
      log('No user profile found in Prisma');
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 401 },
      );
    }

    const roles = prismaProfile.role
      ? [
          {
            id: prismaProfile.role.id,
            name: prismaProfile.role.name,
            level: prismaProfile.role.level,
          },
        ]
      : [];
    const userProfile = {
      id: prismaProfile.id,
      email: prismaProfile.email,
      departmentId: prismaProfile.departmentId,
      roles,
    };

    const primaryRole =
      roles.length > 0 ? roles[0] : { id: 0, name: 'Unknown', level: 0 };
    log('User authenticated', { userId: user.id, role: primaryRole.name });

    const response = NextResponse.json({ user: userProfile });
    response.cookies.set('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });

    return response;
  } catch (error) {
    log('Unexpected error during login', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
// src/app/api/auth/login/route.ts
