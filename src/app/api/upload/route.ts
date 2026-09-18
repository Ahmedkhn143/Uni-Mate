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

    // Size Restrictions Validation
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);
    const isDocument = 
      file.type.includes('pdf') || 
      file.type.includes('word') || 
      file.type.includes('document') || 
      /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt)$/i.test(file.name);

    if (isImage && file.size > 1 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'Image size exceeds the allowed limit of 1 MB. Please choose a smaller photo or compress it.'
      }, { status: 400 });
    }

    if (isDocument && file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'Document size exceeds the allowed limit of 10 MB. Please upload a file up to 10 MB.'
      }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File size exceeds the global maximum limit of 10 MB.'
      }, { status: 400 });
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
