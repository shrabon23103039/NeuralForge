import { generateAuthorityBriefing } from '@/lib/ai/summarizer';
import { getReports } from '@/lib/store';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const department = body.department || 'all';
    const lang = body.lang || 'en';

    const reports = await getReports({ department });
    const briefing = await generateAuthorityBriefing(reports, department, lang);

    return NextResponse.json({ success: true, data: briefing });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to generate authority briefing' }, { status: 500 });
  }
}
