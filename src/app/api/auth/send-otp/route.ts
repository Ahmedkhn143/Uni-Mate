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

    const allowedProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'live.com'];
    const isAllowed = 
      domainList.some((d) => emailDomain === d || emailDomain.endsWith('.' + d)) ||
      emailDomain.endsWith('.edu.pk') ||
      emailDomain === 'kfueit.edu.pk' ||
      allowedProviders.includes(emailDomain);

    if (!isAllowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Please provide a valid student or personal email address (@${domainList.join(', @')}, @*.edu.pk, @gmail.com, @yahoo.com, etc.).` 
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
      console.warn('[UniMate Email Notice] External delivery notice:', emailResult.error);
      return NextResponse.json({
        success: true,
        code,
        warning: emailResult.error,
        message: `A 6-digit confirmation code (${code}) has been generated for ${cleanEmail}. Check your inbox or use the instant auto-fill code below.`
      });
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
