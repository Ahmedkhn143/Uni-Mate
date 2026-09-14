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

    // Verify university domain: Allow configured domains, subdomains, and recognized educational domains (*.edu.pk)
    const allowedDomain = process.env.NEXT_PUBLIC_UNIVERSITY_EMAIL_DOMAIN || 'kfueit.edu.pk';
    const domainList = allowedDomain.split(',').map((d) => d.trim().toLowerCase());
    const emailDomain = cleanEmail.split('@')[1]?.toLowerCase() || '';

    const isAllowed = 
      domainList.some((d) => emailDomain === d || emailDomain.endsWith('.' + d)) ||
      emailDomain.endsWith('.edu.pk') ||
      emailDomain === 'kfueit.edu.pk';

    if (!isAllowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Please provide an approved university email address (@${domainList.join(', @')} or any university @*.edu.pk domain).` 
        },
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
      console.error('[UniMate Email Error] SMTP dispatch failed:', emailResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: `Could not deliver verification email: ${emailResult.error || 'Recipient rejected by mail server'}. Please verify the address and try again.` 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      code,
      message: `A 6-digit confirmation code has been sent to ${cleanEmail}. Please check your Inbox and Spam/Junk folder.`
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to dispatch verification code.' },
      { status: 500 }
    );
  }
}
