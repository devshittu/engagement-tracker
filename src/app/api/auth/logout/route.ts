// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const log = (message: string, data?: any) =>
  console.log(
    `[API:AUTH/LOGOUT] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('sb-access-token')?.value;
    if (token) {
      await supabase.auth.signOut();
    }

    const response = NextResponse.json({ message: 'Logged out' });
    response.cookies.set('sb-access-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    log('User logged out');
    return response;
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
