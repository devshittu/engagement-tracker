// src/app/api/admissions/active/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

const log = (message: string, data?: any) =>
  console.log(
    `[API:ADMISSIONS/ACTIVE] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    log('Unauthorized access attempt');
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

  try {
    // Role-based access control
    if (userProfile.roles.length === 0) {
      log('User has no roles assigned');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userRoleLevel = userProfile.roles[0].level;
    const whereClause: any = { dischargeDate: null };
    if (userRoleLevel < 3) {
      whereClause.admittedBy = {
        departmentId: userProfile.departmentId,
      };
    }

    const admissions = await prisma.admission.findMany({
      where: whereClause,
      include: { serviceUser: true },
    });

    const serialized = admissions.map((admission) => ({
      ...admission,
      admissionDate: admission.admissionDate.toISOString(),
      dischargeDate: admission.dischargeDate?.toISOString() || null,
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    log('Failed to fetch admissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admissions' },
      { status: 500 },
    );
  }
}
// src/app/api/admissions/active/route.ts
