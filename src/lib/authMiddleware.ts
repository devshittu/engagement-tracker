// src/lib/authMiddleware.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';

// type UserProfile = {
//   id: string;
//   email: string;
//   departmentId: number;
//   roles: { id: number; name: string; level: number }[];
// };

// type AuthResult = {
//   userProfile: UserProfile;
//   userId: string;
// };

// export const authenticateRequest = async (
//   req: NextRequest,
//   requiredRoleLevel: number = 0,
//   requiredRoleName?: string,
//   log: (message: string, data?: any) => void = () => {},
// ): Promise<AuthResult | NextResponse> => {
//   const authHeader = req.headers.get('Authorization');
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     log('Unauthorized access attempt: Missing or invalid Authorization header');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const token = authHeader.split(' ')[1];
//   const { data: { user }, error: userError } = await supabase.auth.getUser(token);
//   if (userError || !user) {
//     log('Failed to authenticate user:', userError?.message);
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   // Fetch user profile with error handling for multiple/no rows
//   const { data: userProfiles, error: profileError } = await supabase
//     .from('users')
//     .select('id, email, departmentId, roles (id, name, level)')
//     .eq('id', user.id);

//   if (profileError) {
//     log('Failed to fetch user profile:', profileError.message);
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   if (!userProfiles || userProfiles.length === 0) {
//     log('No user profile found for authenticated user', { userId: user.id });
//     return NextResponse.json({ error: 'Unauthorized: User profile not found' }, { status: 401 });
//   }

//   if (userProfiles.length > 1) {
//     log('Multiple user profiles found for authenticated user', { userId: user.id, count: userProfiles.length });
//     return NextResponse.json({ error: 'Server error: Multiple user profiles detected' }, { status: 500 });
//   }

//   const userProfile = userProfiles[0] as UserProfile;
//   const roles = userProfile.roles || [];
//   if (roles.length === 0) {
//     log('User has no roles assigned', { userId: user.id });
//     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//   }

//   const userRole = roles[0];
//   if (requiredRoleLevel > 0 && userRole.level < requiredRoleLevel && userRole.name !== 'Super Admin') {
//     log('Insufficient permissions: Role level too low', {
//       requiredLevel: requiredRoleLevel,
//       userLevel: userRole.level,
//     });
//     return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
//   }

//   if (requiredRoleName && userRole.name !== requiredRoleName) {
//     log('Insufficient permissions: Role name mismatch', {
//       requiredRole: requiredRoleName,
//       userRole: userRole.name,
//     });
//     return NextResponse.json({ error: `Only ${requiredRoleName} can perform this action` }, { status: 403 });
//   }

//   log('User authenticated successfully', { userId: user.id, role: userRole.name });
//   return { userProfile, userId: user.id };
// };





// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';

// type UserProfile = {
//   id: string;
//   email: string;
//   departmentId: number;
//   roles: { id: number; name: string; level: number }[];
// };

// type AuthResult = {
//   userProfile: UserProfile;
//   userId: string;
// };

// export const authenticateRequest = async (
//   req: NextRequest,
//   requiredRoleLevel: number = 0,
//   requiredRoleName?: string,
//   log: (message: string, data?: any) => void = () => {},
// ): Promise<AuthResult | NextResponse> => {
//   const authHeader = req.headers.get('Authorization');
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     log('Unauthorized access attempt: Missing or invalid Authorization header');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const token = authHeader.split(' ')[1];
//   log('Bearer token received:', { token }); // Log token for Insomnia testing

//   const { data: { user }, error: userError } = await supabase.auth.getUser(token);
//   if (userError || !user) {
//     log('Failed to authenticate user:', userError?.message);
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   // Set the token in the Supabase client headers for RLS
//   const { data: userProfiles, error: profileError } = await supabase
//     .from('users')
//     .select('id, email, departmentId, roles (id, name, level)')
//     .eq('id', user.id)
//     .setHeader('Authorization', `Bearer ${token}`); // Explicitly set token

//   if (profileError) {
//     log('Failed to fetch user profile:', profileError.message);
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   if (!userProfiles || userProfiles.length === 0) {
//     log('No user profile found for authenticated user', { userId: user.id });
//     return NextResponse.json({ error: 'Unauthorized: User profile not found' }, { status: 401 });
//   }

//   if (userProfiles.length > 1) {
//     log('Multiple user profiles found for authenticated user', { userId: user.id, count: userProfiles.length });
//     return NextResponse.json({ error: 'Server error: Multiple user profiles detected' }, { status: 500 });
//   }

//   const userProfile = userProfiles[0] as UserProfile;
//   const roles = userProfile.roles || [];
//   if (roles.length === 0) {
//     log('User has no roles assigned', { userId: user.id });
//     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//   }

//   const userRole = roles[0];
//   if (requiredRoleLevel > 0 && userRole.level < requiredRoleLevel && userRole.name !== 'Super Admin') {
//     log('Insufficient permissions: Role level too low', {
//       requiredLevel: requiredRoleLevel,
//       userLevel: userRole.level,
//     });
//     return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
//   }

//   if (requiredRoleName && userRole.name !== requiredRoleName) {
//     log('Insufficient permissions: Role name mismatch', {
//       requiredRole: requiredRoleName,
//       userRole: userRole.name,
//     });
//     return NextResponse.json({ error: `Only ${requiredRoleName} can perform this action` }, { status: 403 });
//   }

//   log('User authenticated successfully', { userId: user.id, role: userRole.name });
//   return { userProfile, userId: user.id };
// };

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

type UserProfile = {
  id: string;
  email: string;
  department_id: number;
  role_id: number;
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
  log('Bearer token received:', { token });

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) {
    log('Failed to authenticate user:', { error: userError?.message });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userProfile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('id, email, department_id, role_id, roles (id, name, level)')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    log('Failed to fetch user profile:', { error: profileError?.message, userId: user.id });
    return NextResponse.json({ error: 'Unauthorized: User profile not found' }, { status: 401 });
  }

  log('Fetched user profile:', { userProfile });

  const roles = userProfile.roles || [];
  if (!userProfile.role_id || roles.length === 0) {
    log('User has no role assigned or role fetch failed', { userId: user.id, roleId: userProfile.role_id });
    return NextResponse.json({ error: 'Forbidden: No role assigned' }, { status: 403 });
  }

  const userRole = roles.find((r) => r.id === userProfile.role_id);
  if (!userRole) {
    log('Role mismatch or not found', { userId: user.id, roleId: userProfile.role_id, roles });
    return NextResponse.json({ error: 'Forbidden: Role data incomplete' }, { status: 403 });
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