// app/api/wards/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const wards = await prisma.ward.findMany();
    return NextResponse.json(wards);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch wards.' },
      { status: 500 },
    );
  }
}
