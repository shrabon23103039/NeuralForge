import { seedDemoData } from '@/lib/store';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const seeded = await seedDemoData();
    return NextResponse.json({ success: true, count: seeded.length, data: seeded });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to seed demo data' }, { status: 500 });
  }
}
