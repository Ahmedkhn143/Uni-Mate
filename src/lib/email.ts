import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export async function sendVerificationEmail(
  toEmail: string,
  otpCode: string,
  studentName?: string
): Promise<{ success: boolean; error?: string }> {
  const cleanToEmail = toEmail.trim().toLowerCase();
  const user = process.env.SMTP_USER || 'ahmadkha8143@gmail.com';
  const pass = process.env.SMTP_PASS || 'jkakkhitvnjbvtmg';
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

  // Strategy 1: If recipient is the Resend account owner, try Resend SDK first
  if (resendApiKey && cleanToEmail === 'ahmadkha8143@gmail.com') {
    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: cleanToEmail,
        subject: `UniMate KFUEIT Verification Code: ${otpCode}`,
        text: plainTextContent,
        html: htmlContent
      });

      if (!error && data?.id) {
        console.log(`[UniMate Resend SDK] Successfully delivered OTP code to ${cleanToEmail}, ID: ${data.id}`);
        return { success: true };
      }
    } catch (resendErr: any) {
      console.warn('[UniMate Resend Notice] Falling back to Gmail SMTP:', resendErr?.message);
    }
  }

  // Strategy 2: For ANY other recipient (friends, students, gmail, yahoo, outlook, kfueit.edu.pk),
  // dispatch via Google Gmail SMTP which can deliver to ANY email worldwide
  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from: `"UniMate KFUEIT" <${user}>`,
        to: cleanToEmail,
        subject: `UniMate KFUEIT Verification Code: ${otpCode}`,
        text: plainTextContent,
        html: htmlContent,
      });

      console.log(`[UniMate Email] Successfully dispatched verification code to ${cleanToEmail}, MessageId: ${info.messageId}`);
      return { success: true };
    } catch (smtpErr: any) {
      console.error('[UniMate Email Error] SMTP dispatch failed:', smtpErr);
      return { success: false, error: smtpErr?.message || 'Failed to dispatch email via SMTP.' };
    }
  }

  // Fallback log for local dev when credentials aren't set
  console.log(`[UniMate Real Code] To: ${cleanToEmail} | Code: ${otpCode}`);
  return { success: true };
}
