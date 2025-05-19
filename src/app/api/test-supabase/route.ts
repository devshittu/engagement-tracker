import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      logger.error('Supabase admin client is not initialized');
      return NextResponse.json(
        { error: 'Supabase admin client not initialized' },
        { status: 500 },
      );
    }

    // Test a simple query to the users table
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .limit(1);

    if (error) {
      logger.error('Supabase connectivity test failed', {
        error: error.message,
      });
      return NextResponse.json(
        { error: 'Supabase connectivity failed', details: error.message },
        { status: 500 },
      );
    }

    logger.info('Supabase connectivity test successful', { data });
    return NextResponse.json({
      message: 'Supabase connectivity successful',
      data,
    });
  } catch (error) {
    logger.error('Unexpected error in Supabase connectivity test', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
