// src/lib/authMiddleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    log('Unauthorized access attempt: Missing or invalid Authorization header');
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  log('Bearer token received:', { token: token.slice(0, 10) + '...' }); // Truncate for security

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) {
    log('Failed to authenticate user:', userError?.message);
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }

  const { data: userProfile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('id, email, departmentId, roles (id, name, level)')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    log('Failed to fetch user profile:', profileError?.message);
    return NextResponse.json({ error: 'Unauthorized: User profile not found' }, { status: 401 });
  }

  const roles = userProfile.roles || [];
  if (roles.length === 0) {
    log('User has no roles assigned', { userId: user.id });
    return NextResponse.json({ error: 'Forbidden: No roles assigned' }, { status: 403 });
  }

  const userRole = roles[0]; // Assuming one role per user as per schema
  if (requiredRoleLevel > 0 && userRole.level < requiredRoleLevel && userRole.name !== 'Super Admin') {
    log('Insufficient permissions: Role level too low', {
      requiredLevel: requiredRoleLevel,
      userLevel: userRole.level,
    });
    return NextResponse.json({ error: 'Forbidden: Insufficient role level' }, { status: 403 });
  }

  if (requiredRoleName && userRole.name !== requiredRoleName) {
    log('Insufficient permissions: Role name mismatch', {
      requiredRole: requiredRoleName,
      userRole: userRole.name,
    });
    return NextResponse.json({ error: `Forbidden: Only ${requiredRoleName} can perform this action` }, { status: 403 });
  }

  log('User authenticated successfully', { userId: user.id, role: userRole.name });
  return { userProfile, userId: user.id };
};
// src/lib/authMiddleware.ts