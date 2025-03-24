import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    log('Failed to authenticate user:', userError?.message);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, email, departmentId, roles (id, name, level)')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    log('Failed to fetch user profile:', profileError?.message);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Since we're ignoring role-based access control for now, we'll add basic checks
  // This will be expanded later when we implement RBAC
  if (userProfile.roles.length === 0) {
    log('User has no roles assigned');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const userRole = userProfile.roles[0];
  if (requiredRoleLevel > 0 && userRole.level < requiredRoleLevel && userRole.name !== 'Super Admin') {
    log('Insufficient permissions: Role level too low', { requiredLevel: requiredRoleLevel, userLevel: userRole.level });
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  if (requiredRoleName && userRole.name !== requiredRoleName) {
    log('Insufficient permissions: Role name mismatch', { requiredRole: requiredRoleName, userRole: userRole.name });
    return NextResponse.json({ error: `Only ${requiredRoleName} can perform this action` }, { status: 403 });
  }

  log('User authenticated successfully', { userId: user.id, role: userRole.name });
  return { userProfile, userId: user.id };
};