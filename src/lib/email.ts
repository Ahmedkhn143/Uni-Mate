import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export async function sendVerificationEmail(
  toEmail: string,
  otpCode: string,
  studentName?: string
): Promise<{ success: boolean; error?: string }> {
  const cleanToEmail = toEmail.trim().toLowerCase();
  const user = process.env.SMTP_USER || 'ahmadkha8143@gmail.com';
  const pass = process.env.SMTP_PASS;
  const resendApiKey = process.env.RESEND_API_KEY;

  const htmlContent = `
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
        Hello ${studentName || 'Student'}, use the following 6-digit confirmation code to complete your UniMate registration:
      </p>
      <div style="background-color: #f1f5f9; border: 2px dashed #6366f1; border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 24px;">
        <span style="font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #4338ca;">
          ${otpCode}
        </span>
      </div>
      <p style="color: #64748b; font-size: 12px; text-align: center; line-height: 1.6;">
        This code is valid for <strong>10 minutes</strong>.<br>
        If you did not request this code, you can safely ignore this email.
      </p>
    </div>
  `;

  const plainTextContent = `UniMate KFUEIT Verification Code: ${otpCode}\n\nHello ${studentName || 'Student'},\nYour 6-digit verification code is: ${otpCode}\n\nThis code expires in 10 minutes.\nIf you did not request this, please ignore this email.`;

  // Strategy 1: Try Resend SDK first (most reliable for transactional email)
  // Resend free tier only allows sending TO the account owner's email.
  // For any other recipient, it needs a verified custom domain.
  if (resendApiKey && resendApiKey !== 're_placeholder') {
    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: cleanToEmail,
        subject: `UniMate KFUEIT — Your Verification Code: ${otpCode}`,
        text: plainTextContent,
        html: htmlContent,
      });

      if (!error && data?.id) {
        console.log(`[UniMate Resend] Delivered OTP to ${cleanToEmail}, ID: ${data.id}`);
        return { success: true };
      }

      // Log the Resend error but continue to SMTP fallback
      console.warn('[UniMate Resend] Resend error (falling back to Gmail SMTP):', error?.message || 'Unknown Resend error');
    } catch (resendErr: any) {
      console.warn('[UniMate Resend] Exception (falling back to Gmail SMTP):', resendErr?.message);
    }
  }

  // Strategy 2: Gmail SMTP (can deliver to ANY email worldwide)
  // Requires a valid Gmail App Password (not your normal password).
  // To generate: Google Account → Security → 2-Step Verification → App passwords
  if (user && pass && pass !== 'your-app-password-here') {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // SSL
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false, // allow self-signed certs in dev
        },
      });

      // Verify SMTP connection before sending
      await transporter.verify();

      const info = await transporter.sendMail({
        from: `"UniMate KFUEIT" <${user}>`,
        to: cleanToEmail,
        subject: `UniMate KFUEIT — Your Verification Code: ${otpCode}`,
        text: plainTextContent,
        html: htmlContent,
      });

      console.log(`[UniMate SMTP] Delivered OTP to ${cleanToEmail}, MessageId: ${info.messageId}`);
      return { success: true };
    } catch (smtpErr: any) {
      const errMsg = smtpErr?.message || 'SMTP error';
      console.error('[UniMate SMTP] Delivery failed:', errMsg);

      // Provide actionable error messages for common Gmail SMTP issues
      if (errMsg.includes('Invalid login') || errMsg.includes('Username and Password not accepted')) {
        return {
          success: false,
          error:
            'Gmail SMTP authentication failed. Please verify your App Password in .env.local (SMTP_PASS). ' +
            'Generate one at: Google Account → Security → 2-Step Verification → App passwords.',
        };
      }
      if (errMsg.includes('Connection timeout') || errMsg.includes('ETIMEDOUT')) {
        return {
          success: false,
          error: 'SMTP connection timed out. Please check your internet connection or firewall settings.',
        };
      }

      return { success: false, error: errMsg };
    }
  }

  // Strategy 3: Dev-mode fallback — log the code to console so developers can
  // test the OTP flow without email credentials configured.
  console.log(
    `\n[UniMate Dev] ========================================\n` +
    `[UniMate Dev] OTP CODE for ${cleanToEmail}: ${otpCode}\n` +
    `[UniMate Dev] (Configure SMTP_PASS or RESEND_API_KEY to send real emails)\n` +
    `[UniMate Dev] ========================================\n`
  );

  // In development, we return success so the OTP flow can be tested
  // without email credentials. In production, missing credentials is an error.
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error:
        'Email delivery is not configured. Please set SMTP_PASS (Gmail App Password) or RESEND_API_KEY in your environment variables.',
    };
  }

  return { success: true };
}
