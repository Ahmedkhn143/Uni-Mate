import { Resend } from 'resend';
import nodemailer from 'nodemailer';

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

// ─── Gmail SMTP Transporter ─────────────────────────────────────────────────
async function sendViaGmailSMTP(
  toEmail: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  const smtpUser = process.env.SMTP_USER || 'ahmadkha8143@gmail.com';
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpPass) {
    return {
      success: false,
      error: 'SMTP_PASS is not set in environment variables. Please add your Gmail App Password to .env.local.',
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

    // Verify connection first — throws if credentials are wrong
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"UniMate KFUEIT" <${smtpUser}>`,
      to: toEmail,
      subject,
      text,
      html,
    });

    console.log(`[UniMate SMTP] ✅ Delivered to ${toEmail} — MessageId: ${info.messageId}`);
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

// ─── Resend SDK ──────────────────────────────────────────────────────────────
async function sendViaResend(
  toEmail: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return { success: false, error: 'No Resend API key.' };

  try {
    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: toEmail,
      subject,
      html,
      text,
    });

    if (error) {
      console.warn(`[UniMate Resend] ⚠️ Error for ${toEmail}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[UniMate Resend] ✅ Delivered to ${toEmail}, ID: ${data?.id}`);
    return { success: true };
  } catch (err: any) {
    console.warn('[UniMate Resend] ❌ Exception:', err?.message);
    return { success: false, error: err?.message };
  }
}

// ─── Main Export ─────────────────────────────────────────────────────────────
/**
 * Sends a verification OTP email to the given address.
 *
 * Strategy:
 *  1. Gmail SMTP  → primary for ALL emails (works with any recipient worldwide)
 *  2. Resend      → fallback ONLY for the account owner's email (free tier limitation)
 *  3. Console log → last resort in development so the flow can still be tested
 *
 * WHY Gmail SMTP first?
 *  Resend free tier with `onboarding@resend.dev` can ONLY send to the Resend
 *  account owner's verified email. For any other recipient it returns a 403 error.
 *  Gmail SMTP has NO such restriction — it can deliver to any email on earth.
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

  // ── Strategy 1: Gmail SMTP (PRIMARY — works for ALL recipients) ────────────
  console.log(`[UniMate Email] Sending OTP to ${cleanToEmail} via Gmail SMTP...`);
  const smtpResult = await sendViaGmailSMTP(cleanToEmail, subject, html, text);
  if (smtpResult.success) return { success: true };

  console.warn(`[UniMate Email] Gmail SMTP failed: ${smtpResult.error}`);

  // ── Strategy 2: Resend (FALLBACK — free tier only works for owner's email) ─
  // This will succeed for `ahmadkha8143@gmail.com` but fail for others.
  // It is kept as a backup in case SMTP is temporarily down.
  console.log(`[UniMate Email] Trying Resend fallback for ${cleanToEmail}...`);
  const resendResult = await sendViaResend(cleanToEmail, subject, html, text);
  if (resendResult.success) return { success: true };

  console.warn(`[UniMate Email] Resend also failed: ${resendResult.error}`);

  // ── Strategy 3: Dev console fallback ─────────────────────────────────────
  console.log(
    `\n[UniMate Dev] ================================================\n` +
    `[UniMate Dev] 📧 OTP CODE for ${cleanToEmail}: ${otpCode}\n` +
    `[UniMate Dev] (Fix SMTP_PASS in .env.local to send real emails)\n` +
    `[UniMate Dev] ================================================\n`
  );

  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error:
        `Email delivery failed. Gmail SMTP error: ${smtpResult.error}. ` +
        `Please verify your SMTP_PASS (Gmail App Password) in environment variables.`,
    };
  }

  // In development, return success so the OTP flow can be tested using the console log above
  return { success: true };
}
