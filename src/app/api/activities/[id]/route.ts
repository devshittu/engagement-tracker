// src/app/api/activities/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { UpdateActivityInput } from '@/features/activities/types';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.log('API: Failed to authenticate user:', userError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, departmentId, roles (id, name, level)')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      console.log('API: Failed to fetch user profile:', profileError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(params.id) },
      include: { department: true },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Role-based access control: Check if user has permission to view this activity
    if (userProfile.roles.length === 0) {
      console.log('API: User has no roles assigned');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userRoleLevel = userProfile.roles[0].level;
    if (userRoleLevel < 3 && activity.departmentId !== userProfile.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(activity, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error fetching activity ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.log('API: Failed to authenticate user:', userError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, departmentId, roles (id, name, level)')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      console.log('API: Failed to fetch user profile:', profileError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateActivityInput = await request.json();
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Role-based access control: Check if user has permission to update this activity
    if (userProfile.roles.length === 0) {
      console.log('API: User has no roles assigned');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userRoleLevel = userProfile.roles[0].level;
    if (userRoleLevel < 3 && activity.departmentId !== userProfile.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        description: body.description,
        departmentId: body.departmentId ?? null,
        updatedAt: new Date(),
      },
      include: { department: true },
    });

    return NextResponse.json(updatedActivity, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error updating activity ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.log('API: Failed to authenticate user:', userError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, departmentId, roles (id, name, level)')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      console.log('API: Failed to fetch user profile:', profileError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Role-based access control: Check if user has permission to delete this activity
    if (userProfile.roles.length === 0) {
      console.log('API: User has no roles assigned');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userRoleLevel = userProfile.roles[0].level;
    if (userRoleLevel < 3 && activity.departmentId !== userProfile.departmentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.activity.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Activity deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error(`Error deleting activity ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}