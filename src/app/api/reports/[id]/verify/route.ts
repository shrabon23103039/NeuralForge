import { voteOnReport } from '@/lib/store';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { vote_type } = body;

    if (!vote_type || (vote_type !== 'confirm' && vote_type !== 'dispute')) {
      return NextResponse.json(
        { success: false, error: 'vote_type must be either confirm or dispute' },
        { status: 400 }
      );
    }

    const updated = await voteOnReport(id, vote_type);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    console.error('Failed to record verification vote:', err);
    return NextResponse.json({ success: false, error: 'Failed to record verification vote' }, { status: 500 });
  }
}
