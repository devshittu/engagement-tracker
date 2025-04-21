// src/lib/authMiddleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

type UserProfile = {
  id: string;
  email: string;
  departmentId: number;
  roles: { id: number; name: string; level: number }[];
};

type AuthResult = {
  userProfile: UserProfile;
  userId: string;
};

export const authenticateRequest = async (
  req: NextRequest,
  requiredRoleLevel: number = 0,
  requiredRoleName?: string,
  log: (message: string, data?: any) => void = () => {},
): Promise<AuthResult | NextResponse> => {
  const token =
    req.cookies.get('sb-access-token')?.value ||
    req.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    log('Unauthorized access attempt: Missing token');
    return NextResponse.json(
      { error: 'Unauthorized: Missing token' },
      { status: 401 },
    );
  }

  log('Token received:', { token: token.slice(0, 10) + '...' });

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) {
    log('Failed to authenticate user:', userError?.message);
    return NextResponse.json(
      { error: 'Unauthorized: Invalid token' },
      { status: 401 },
    );
  }

  let userProfile: UserProfile | null = null;
  const { data: supabaseProfile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('id, email, departmentId, roles (id, name, level)')
    .eq('id', user.id)
    .single();

  if (profileError || !supabaseProfile) {
    log('Supabase profile fetch failed, falling back to Prisma', {
      error: profileError?.message,
    });
    const prismaProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    if (!prismaProfile) {
      log('Failed to fetch user profile from Prisma');
      return NextResponse.json(
        { error: 'Unauthorized: User profile not found' },
        { status: 401 },
      );
    }

    userProfile = {
      id: prismaProfile.id,
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
  } else {
    userProfile = supabaseProfile;
  }

  const roles = userProfile.roles || [];
  if (roles.length === 0) {
    log('User has no roles assigned', { userId: user.id });
    return NextResponse.json(
      { error: 'Forbidden: No roles assigned' },
      { status: 403 },
    );
  }

  const userRole = roles[0];
  if (
    requiredRoleLevel > 0 &&
    userRole.level < requiredRoleLevel &&
    userRole.name !== 'Super Admin'
  ) {
    log('Insufficient permissions: Role level too low', {
      requiredLevel: requiredRoleLevel,
      userLevel: userRole.level,
    });
    return NextResponse.json(
      { error: 'Forbidden: Insufficient role level' },
      { status: 403 },
    );
  }

  if (requiredRoleName && userRole.name !== requiredRoleName) {
    log('Insufficient permissions: Role name mismatch', {
      requiredRole: requiredRoleName,
      userRole: userRole.name,
    });
    return NextResponse.json(
      { error: `Forbidden: Only ${requiredRoleName} can perform this action` },
      { status: 403 },
    );
  }

  log('User authenticated successfully', {
    userId: user.id,
    role: userRole.name,
  });
  return { userProfile, userId: user.id };
};
// src/lib/authMiddleware.ts
