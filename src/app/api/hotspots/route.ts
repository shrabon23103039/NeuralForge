import { calculateHeatmapHotspots } from '@/lib/heatmap/calculator';
import { getReports } from '@/lib/store';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const reports = await getReports();
    const hotspots = calculateHeatmapHotspots(reports);
    return NextResponse.json({ success: true, count: hotspots.length, data: hotspots });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to calculate hotspots' }, { status: 500 });
  }
}
