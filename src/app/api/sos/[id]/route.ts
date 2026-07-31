import { updateSOSStatus } from '@/lib/store';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || (status !== 'acknowledged' && status !== 'resolved')) {
      return NextResponse.json(
        { success: false, error: 'Status must be acknowledged or resolved' },
        { status: 400 }
      );
    }

    const updated = await updateSOSStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'SOS alert not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to update SOS alert status' }, { status: 500 });
  }
}
