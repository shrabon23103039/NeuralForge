import { createServiceRoleClient } from './server';

export async function uploadReportPhoto(
  photoBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<string | null> {
  try {
    const supabase = createServiceRoleClient();
    const buffer = Buffer.from(photoBase64, 'base64');
    const ext = mimeType.split('/')[1] || 'jpeg';
    const fileName = `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('reports')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from('reports')
        .getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    } else {
      console.warn('[Supabase Storage] Upload warning:', error?.message);
    }
  } catch (err) {
    console.warn('[Supabase Storage] Upload error:', err);
  }

  return null;
}
