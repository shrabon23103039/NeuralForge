import { classifyReport } from '@/lib/ai/classifier';
import { createReport, getReports } from '@/lib/store';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const department = searchParams.get('department') || undefined;

    const reports = await getReports({ type, status, department });
    return NextResponse.json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    console.error('[API /api/reports GET Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, category, report_type, lat, lng, photo_url, photoBase64, mimeType } = body;

    if (!description || !lat || !lng) {
      return NextResponse.json(
        { success: false, error: 'Description, lat, and lng are required fields.' },
        { status: 400 }
      );
    }

    // Call Gemini AI Classification Pipeline
    const aiResult = await classifyReport(
      description,
      category,
      photoBase64,
      mimeType || 'image/jpeg'
    );

    const reportToCreate = {
      description,
      report_type: report_type || (aiResult.category === 'robbery' || aiResult.category === 'snatching' ? 'crime' : 'hazard'),
      category: aiResult.category || category || 'other',
      lat: Number(lat),
      lng: Number(lng),
      photo_url: photo_url || null,
      severity: aiResult.severity,
      ai_is_valid: aiResult.is_valid_report,
      ai_summary_en: aiResult.summary_en,
      ai_summary_bn: aiResult.summary_bn,
      target_department: aiResult.target_department,
      status: 'received' as const,
    };

    const created = await createReport(reportToCreate);

    return NextResponse.json({
      success: true,
      data: created,
      ai_classification: aiResult,
    });
  } catch (err) {
    console.error('[API /api/reports POST Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to create report' }, { status: 500 });
  }
}
