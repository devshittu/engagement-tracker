// src/lib/authMiddleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type UserProfile = {
  id: string;
  email: string;
  departmentId: number;
  role: { id: number; name: string; level: number };
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
  const supabase = supabaseAdmin; // Uses service key, no cookie config needed

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    log('Failed to authenticate user via cookies:', userError?.message);

    // Fallback to token if cookies fail
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      log('Unauthorized: Missing or invalid Authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    log('Bearer token received:', { token: token.slice(0, 10) + '...' });
    const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
    if (tokenError || !tokenUser) {
      log('Failed to authenticate user via token:', tokenError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Use tokenUser as user
    user = tokenUser;
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, email, departmentId, role (id, name, level)')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    log('Failed to fetch user profile:', profileError?.message);
    return NextResponse.json({ error: 'Unauthorized: User profile not found' }, { status: 401 });
  }

  const userRole = userProfile.role;
  if (!userRole) {
    log('User has no role assigned', { userId: user.id });
    return NextResponse.json({ error: 'Forbidden: No role assigned' }, { status: 403 });
  }

  if (requiredRoleLevel > 0 && userRole.level < requiredRoleLevel && userRole.name !== 'Super Admin') {
    log('Insufficient permissions: Role level too low', {
      requiredLevel: requiredRoleLevel,
      userLevel: userRole.level,
    });
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  if (requiredRoleName && userRole.name !== requiredRoleName) {
    log('Insufficient permissions: Role name mismatch', {
      requiredRole: requiredRoleName,
      userRole: userRole.name,
    });
    return NextResponse.json({ error: `Only ${requiredRoleName} can perform this action` }, { status: 403 });
  }

  log('User authenticated successfully', { userId: user.id, role: userRole.name });
  return { userProfile, userId: user.id };
};
// src/lib/authMiddleware.ts