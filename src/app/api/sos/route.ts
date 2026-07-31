import { createSOSAlert, getSOSAlerts } from '@/lib/store';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const alerts = await getSOSAlerts();
    return NextResponse.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch SOS alerts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lat, lng, user_id } = body;

    if (!lat || !lng) {
      return NextResponse.json({ success: false, error: 'lat and lng are required for SOS' }, { status: 400 });
    }

    const alert = await createSOSAlert(Number(lat), Number(lng), user_id);
    return NextResponse.json({ success: true, data: alert });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to trigger SOS alert' }, { status: 500 });
  }
}
