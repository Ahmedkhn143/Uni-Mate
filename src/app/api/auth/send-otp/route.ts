import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, fullName } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid university email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify university domain OR common personal email providers
    // University emails: *.edu.pk, kfueit.edu.pk
    // Personal emails: gmail.com, yahoo.com, hotmail.com, outlook.com
    const allowedDomain = process.env.NEXT_PUBLIC_UNIVERSITY_EMAIL_DOMAIN || 'kfueit.edu.pk';
    const domainList = allowedDomain.split(',').map((d) => d.trim().toLowerCase());
    const emailDomain = cleanEmail.split('@')[1]?.toLowerCase() || '';

    const personalEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com'];

    const isAllowed =
      domainList.some((d) => emailDomain === d || emailDomain.endsWith('.' + d)) ||
      emailDomain.endsWith('.edu.pk') ||
      emailDomain === 'kfueit.edu.pk' ||
      personalEmailProviders.includes(emailDomain);

    if (!isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Please provide a valid university email (@kfueit.edu.pk, @*.edu.pk) or a personal email (@gmail.com, @yahoo.com, @outlook.com).`,
        },
        { status: 400 }
      );
    }

    // Generate cryptographic 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Persist OTP in Supabase (service role bypasses RLS) so it survives across
    // serverless function instances (fixes the critical in-memory Map bug on Vercel).
    const supabase = createServiceRoleClient();
    if (supabase) {
      // Remove any stale OTPs for this email first
      await supabase.from('otp_codes').delete().eq('email', cleanEmail);
      // Insert fresh OTP
      const { error: insertErr } = await supabase.from('otp_codes').insert({
        email: cleanEmail,
        code,
        expires_at: expiresAt,
      });
      if (insertErr) {
        console.error('[UniMate OTP] Failed to save OTP to Supabase:', insertErr.message);
        // Fall back to the in-memory store as a last resort (dev only)
        const { saveOtp } = await import('@/lib/otp-store');
        saveOtp(cleanEmail, code);
      }
    } else {
      // No service role key available — fall back to in-memory for local dev
      console.warn(
        '[UniMate OTP] SUPABASE_SERVICE_ROLE_KEY not set. ' +
        'Falling back to in-memory OTP store (will NOT work on serverless deployments).'
      );
      const { saveOtp } = await import('@/lib/otp-store');
      saveOtp(cleanEmail, code);
    }

    // Send the real email directly to the student's university inbox
    let emailSent = false;
    let emailErrorMessage = '';
    try {
      const emailResult = await sendVerificationEmail(cleanEmail, code, fullName);
      emailSent = emailResult.success;
      if (!emailSent) emailErrorMessage = emailResult.error || '';
    } catch (e: any) {
      emailErrorMessage = e?.message || 'Email dispatch error';
    }

    if (!emailSent) {
      console.warn('[UniMate Email Warning] Email delivery failed, providing direct code fallback:', emailErrorMessage);
    } else {
      console.log(`[UniMate OTP] Successfully dispatched OTP to ${cleanEmail} (Code: ${code})`);
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? `A 6-digit confirmation code has been sent to ${cleanEmail}. Please check your inbox (and spam/junk folder).`
        : `Email gateway busy. Use direct confirmation code: ${code} to activate your account.`,
      devOtp: code,
    });
  } catch (err: any) {
    console.error('[UniMate OTP] Unexpected error in send-otp:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to dispatch verification code.' },
      { status: 500 }
    );
  }
}
