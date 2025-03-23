// src/app/api/activity-continuity-logs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

type Params = { params: { id: string } };

const log = (message: string, data?: any) =>
  console.log(
    `[API:ACTIVITY_CONTINUITY_LOGS/ID] ${message}`,
    data ? JSON.stringify(data, null, 2) : '',
  );

export async function GET(req: NextRequest, { params }: Params) {
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

  const { id } = params;
  const logId = parseInt(id);

  if (isNaN(logId)) {
    log('Invalid log ID', { id });
    return NextResponse.json({ error: 'Invalid log ID' }, { status: 400 });
  }

  try {
    log('Fetching continuity log', { id: logId });
    const logEntry = await prisma.activityContinuityLog.findUnique({
      where: { id: logId },
      include: { activity: { include: { department: true } }, createdBy: true },
    });

    if (!logEntry) {
      log('Continuity log not found', { id: logId });
      return NextResponse.json(
        { error: 'Continuity log not found' },
        { status: 404 },
      );
    }

    // Role-based access control
    if (userProfile.roles.length === 0) {
      log('User has no roles assigned');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userRoleLevel = userProfile.roles[0].level;
    if (userRoleLevel < 3 && logEntry.activity.departmentId !== userProfile.departmentId) {
      log('Forbidden: User does not have permission to view this log');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    log('Continuity log fetched successfully', { id: logEntry.id });
    return NextResponse.json({
      ...logEntry,
      startDate: logEntry.startDate.toISOString(),
      discontinuedDate: logEntry.discontinuedDate?.toISOString() || null,
    });
  } catch (error) {
    log('Failed to fetch continuity log', error);
    return NextResponse.json(
      { error: 'Failed to fetch continuity log' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
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

  const { id } = params;
  const logId = parseInt(id);

  if (isNaN(logId)) {
    log('Invalid log ID', { id });
    return NextResponse.json({ error: 'Invalid log ID' }, { status: 400 });
  }

  try {
    const { startDate, discontinuedDate, reason, duration } = await req.json();
    log('Updating continuity log', {
      id: logId,
      startDate,
      discontinuedDate,
      reason,
      duration,
    });

    const logEntry = await prisma.activityContinuityLog.findUnique({
      where: { id: logId },
      include: { activity: true },
    });

    if (!logEntry) {
      log('Continuity log not found', { id: logId });
      return NextResponse.json({ error: 'Continuity log not found' }, { status: 404 });
    }

    // Role-based access control
    if (userProfile.roles.length === 0) {
      log('User has no roles assigned');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userRoleLevel = userProfile.roles[0].level;
    if (userRoleLevel < 3 && logEntry.activity.departmentId !== userProfile.departmentId) {
      log('Forbidden: User does not have permission to update this log');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: any = {};
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (discontinuedDate !== undefined)
      updateData.discontinuedDate = discontinuedDate
        ? new Date(discontinuedDate)
        : null;
    if (reason !== undefined) updateData.reason = reason || null;
    if (duration !== undefined) {
      if (!Number.isInteger(duration)) {
        log('Invalid duration');
        return NextResponse.json(
          { error: 'Duration must be an integer' },
          { status: 400 },
        );
      }
      updateData.duration = duration;
    }

    const updatedLogEntry = await prisma.activityContinuityLog.update({
      where: { id: logId },
      data: updateData,
      include: { activity: { include: { department: true } }, createdBy: true },
    });

    log('Continuity log updated successfully', { id: updatedLogEntry.id });
    return NextResponse.json({
      ...updatedLogEntry,
      startDate: updatedLogEntry.startDate.toISOString(),
      discontinuedDate: updatedLogEntry.discontinuedDate?.toISOString() || null,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      log('Continuity log not found', { id: logId });
      return NextResponse.json(
        { error: 'Continuity log not found' },
        { status: 404 },
      );
    }
    log('Failed to update continuity log', error);
    return NextResponse.json(
      { error: 'Failed to update continuity log' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
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

  const { id } = params;
  const logId = parseInt(id);

  if (isNaN(logId)) {
    log('Invalid log ID', { id });
    return NextResponse.json({ error: 'Invalid log ID' }, { status: 400 });
  }

  try {
    const logEntry = await prisma.activityContinuityLog.findUnique({
      where: { id: logId },
      include: { activity: true },
    });

    if (!logEntry) {
      log('Continuity log not found', { id: logId });
      return NextResponse.json({ error: 'Continuity log not found' }, { status: 404 });
    }

    // Role-based access control
    if (userProfile.roles.length === 0) {
      log('User has no roles assigned');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userRoleLevel = userProfile.roles[0].level;
    if (userRoleLevel < 3 && logEntry.activity.departmentId !== userProfile.departmentId) {
      log('Forbidden: User does not have permission to delete this log');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    log('Deleting continuity log', { id: logId });
    await prisma.activityContinuityLog.delete({
      where: { id: logId },
    });
    log('Continuity log deleted successfully', { id: logId });
    return NextResponse.json({
      message: 'Continuity log deleted successfully',
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      log('Continuity log not found', { id: logId });
      return NextResponse.json(
        { error: 'Continuity log not found' },
        { status: 404 },
      );
    }
    log('Failed to delete continuity log', error);
    return NextResponse.json(
      { error: 'Failed to delete continuity log' },
      { status: 500 },
    );
  }
}
// src/app/api/activity-continuity-logs/[id]/route.ts
