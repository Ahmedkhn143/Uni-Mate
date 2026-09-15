import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';

/**
 * Test endpoint to verify email delivery is working.
 * Usage: GET /api/auth/test-email?to=anyemail@gmail.com
 * Remove this file in production after testing.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get('to');

  if (!to || !to.includes('@')) {
    return NextResponse.json({
      success: false,
      error: 'Please provide a valid email: /api/auth/test-email?to=your@email.com',
    }, { status: 400 });
  }

  console.log(`[Test Email] Attempting to send test OTP to: ${to}`);

  const result = await sendVerificationEmail(to.trim().toLowerCase(), '123456', 'Test User');

  return NextResponse.json({
    success: result.success,
    to: to.trim().toLowerCase(),
    error: result.error,
    message: result.success
      ? `✅ Test email sent successfully to ${to}! Check your inbox (and spam folder).`
      : `❌ Email delivery failed: ${result.error}`,
  });
}
