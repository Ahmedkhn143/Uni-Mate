import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// ─── Resend Professional Mailer ──────────────────────────────────────────────
async function sendViaResend(
  toEmail: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY not configured.' };
  }

  try {
    const resend = new Resend(apiKey);
    const fromAddress = process.env.RESEND_FROM || 'UniMate KFUEIT <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (error) {
      console.error(`[UniMate Resend] ❌ Resend error:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[UniMate Resend] ✅ Delivered verification email to ${toEmail} via Resend (ID: ${data?.id})`);
    return { success: true };
  } catch (err: any) {
    const msg = err?.message || 'Unknown Resend error';
    console.error(`[UniMate Resend] ❌ Exception:`, msg);
    return { success: false, error: msg };
  }
}

// ─── Email HTML Template ────────────────────────────────────────────────────
function buildHtmlEmail(otpCode: string, studentName: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #4f46e5; color: #ffffff; font-weight: 700; padding: 8px 18px; border-radius: 10px; font-size: 15px; letter-spacing: 0.5px;">
          🎓 UniMate KFUEIT
        </div>
      </div>
      <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin-bottom: 10px; text-align: center;">
        Your Verification Code
      </h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 24px;">
        Hello <strong>${studentName}</strong>, use the 6-digit code below to complete your UniMate KFUEIT registration:
      </p>
      <div style="background-color: #f1f5f9; border: 2px dashed #6366f1; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-family: 'Courier New', monospace; font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #4338ca;">
          ${otpCode}
        </span>
      </div>
      <p style="color: #64748b; font-size: 12px; text-align: center; line-height: 1.6;">
        This code is valid for <strong>10 minutes</strong>.<br>
        If you did not request this, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">
        UniMate — Official KFUEIT Student Community Platform
      </p>
    </div>
  `;
}

// ─── Gmail SMTP Transporter (Direct Delivery to Registered Student) ──────────
async function sendViaGmailSMTP(
  toEmail: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  const smtpUser = process.env.SMTP_USER || 'ahmadkha8143@gmail.com';
  const smtpPass = process.env.SMTP_PASS || 'jkakkhitvnjbvtmg';

  if (!smtpPass) {
    return {
      success: false,
      error: 'SMTP credentials not configured.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"UniMate KFUEIT" <${smtpUser}>`,
      to: toEmail,
      subject,
      text,
      html,
    });

    console.log(`[UniMate SMTP] ✅ Delivered verification code directly to ${toEmail} — MsgID: ${info.messageId}`);
    return { success: true };
  } catch (err: any) {
    const msg: string = err?.message || 'Unknown SMTP error';
    console.error(`[UniMate SMTP] ❌ Failed to deliver to ${toEmail}:`, msg);

    if (msg.includes('Invalid login') || msg.includes('Username and Password not accepted') || msg.includes('BadCredentials')) {
      return {
        success: false,
        error:
          'Gmail App Password is incorrect. Go to: Google Account → Security → ' +
          '2-Step Verification → App Passwords → generate a new one → paste into SMTP_PASS in .env.local',
      };
    }
    if (msg.includes('ETIMEDOUT') || msg.includes('Connection timeout')) {
      return { success: false, error: 'SMTP connection timed out. Check your internet connection.' };
    }
    return { success: false, error: msg };
  }
}

// ─── Main Export ─────────────────────────────────────────────────────────────
/**
 * Sends a verification OTP email directly to the student's email address.
 * No forwarding or fallback to personal email.
 */
export async function sendVerificationEmail(
  toEmail: string,
  otpCode: string,
  studentName?: string
): Promise<{ success: boolean; error?: string }> {
  const cleanToEmail = toEmail.trim().toLowerCase();
  const name = studentName?.trim() || 'Student';

  const subject = `UniMate KFUEIT — Verification Code: ${otpCode}`;
  const html = buildHtmlEmail(otpCode, name);
  const text =
    `UniMate KFUEIT Verification Code: ${otpCode}\n\n` +
    `Hello ${name},\n` +
    `Your 6-digit verification code is: ${otpCode}\n\n` +
    `This code expires in 10 minutes.\n` +
    `If you did not request this, please ignore this email.`;

  console.log(`[UniMate Email] Sending OTP code directly to student: ${cleanToEmail}`);

  // 1. Try Resend if API Key is configured (Professional transactional email)
  if (process.env.RESEND_API_KEY) {
    console.log(`[UniMate Email] Dispatching via Resend service to ${cleanToEmail}`);
    const resendResult = await sendViaResend(cleanToEmail, subject, html, text);
    if (resendResult.success) {
      return { success: true };
    }
    console.warn(`[UniMate Email] Resend dispatch failed, attempting SMTP fallback: ${resendResult.error}`);
  }

  // 2. Fallback to SMTP
  const smtpResult = await sendViaGmailSMTP(cleanToEmail, subject, html, text);

  if (smtpResult.success) {
    return { success: true };
  }

  console.warn(`[UniMate Email] SMTP dispatch failed for ${cleanToEmail}: ${smtpResult.error}`);

  // Development console log helper if SMTP password fails
  console.log(
    `\n[UniMate Dev] ================================================\n` +
    `[UniMate Dev] 📧 OTP CODE for ${cleanToEmail}: ${otpCode}\n` +
    `[UniMate Dev] Status: SMTP Error (${smtpResult.error})\n` +
    `[UniMate Dev] ================================================\n`
  );

  return {
    success: false,
    error: `Could not deliver verification email to ${cleanToEmail}. ${smtpResult.error || 'Please make sure the email address is correct.'}`,
  };
}

