import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'unimate-files';
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-402cf89eb02b4e2cb5cf060bcbdadbed.r2.dev';

export function getR2Client(): S3Client | null {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.warn('[Cloudflare R2] Credentials not configured.');
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadToR2(params: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  folder?: string;
}): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
  try {
    const client = getR2Client();
    if (!client) {
      return { success: false, error: 'Cloudflare R2 client is not configured.' };
    }

    const cleanFolder = params.folder ? `${params.folder.replace(/^\/+|\/+$/g, '')}/` : '';
    const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${cleanFolder}${Date.now()}_${safeName}`;

    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: params.buffer,
        ContentType: params.contentType,
      })
    );

    const publicUrl = `${R2_PUBLIC_URL.replace(/\/+$/, '')}/${key}`;
    return { success: true, url: publicUrl, key };
  } catch (err: any) {
    console.error('[Cloudflare R2] Upload error:', err);
    return { success: false, error: err?.message || 'Failed to upload to Cloudflare R2' };
  }
}

export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const client = getR2Client();
    if (!client) return false;

    await client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (err) {
    console.error('[Cloudflare R2] Delete error:', err);
    return false;
  }
}
