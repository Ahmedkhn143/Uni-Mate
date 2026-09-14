import { NextResponse } from 'next/server';
import { saveOtp } from '@/lib/otp-store';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, fullName } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid university email.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify university domain
    const allowedDomain = process.env.NEXT_PUBLIC_UNIVERSITY_EMAIL_DOMAIN || 'kfueit.edu.pk';
    const domainList = allowedDomain.split(',').map((d) => d.trim().toLowerCase());
    const emailDomain = cleanEmail.split('@')[1]?.toLowerCase();

    const isAllowed = domainList.some((d) => emailDomain === d || emailDomain?.endsWith('.' + d));
    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: `Only approved university email addresses (@${domainList.join(', @')}) are allowed.` },
        { status: 400 }
      );
    }

    // Generate cryptographic 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save in secure store
    saveOtp(cleanEmail, code);

    // Send the real email
    const emailResult = await sendVerificationEmail(cleanEmail, code, fullName);

    if (!emailResult.success) {
      console.warn('Failed to send email via primary SMTP:', emailResult.error);
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit confirmation code has been sent to ${cleanEmail}.`
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to dispatch verification code.' },
      { status: 500 }
    );
  }
}
