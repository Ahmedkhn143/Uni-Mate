import { NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToR2({
      buffer,
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      folder,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      fileName: file.name,
      size: file.size,
    });
  } catch (err: any) {
    console.error('[Upload API] Error processing file upload:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error uploading file' }, { status: 500 });
  }
}
