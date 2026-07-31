import { getReports, updateReportStatus } from '@/lib/store';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reports = await getReports();
    const report = reports.find(r => r.id === id);

    if (!report) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: report });
  } catch (err: unknown) {
    console.error('Fetch report detail error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch report detail' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const updated = await updateReportStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    console.error('Update report status error:', err);
    return NextResponse.json({ success: false, error: 'Failed to update report status' }, { status: 500 });
  }
}
