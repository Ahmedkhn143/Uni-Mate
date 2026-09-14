import nodemailer from 'nodemailer';

export async function sendVerificationEmail(
  toEmail: string,
  otpCode: string,
  studentName?: string
): Promise<{ success: boolean; error?: string }> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"UniMate KFUEIT" <${user || 'noreply@kfueit.edu.pk'}>`;

  // If SMTP credentials are configured, send real email
  if (user && pass && !user.includes('your-email')) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: #4f46e5; color: #ffffff; font-weight: bold; padding: 10px 18px; border-radius: 12px; font-size: 16px;">
              🎓 UniMate — KFUEIT Campus
            </div>
          </div>
          <h2 style="color: #1e293b; font-size: 20px; font-weight: 800; margin-bottom: 8px; text-align: center;">
            Verify Your University Email
          </h2>
          <p style="color: #64748b; font-size: 13px; line-height: 1.6; text-align: center; margin-bottom: 24px;">
            Hello ${studentName || 'Student'}, please use the following 6-digit confirmation code to activate your verified student account on UniMate:
          </p>
          <div style="background-color: #f8fafc; border: 2px dashed #6366f1; border-radius: 16px; padding: 18px; text-align: center; margin-bottom: 24px;">
            <span style="font-family: monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #4338ca;">
              ${otpCode}
            </span>
          </div>
          <p style="color: #94a3b8; font-size: 11px; text-align: center; line-height: 1.5;">
            This verification code will expire in <strong>10 minutes</strong>.<br>
            If you did not attempt to register on UniMate KFUEIT, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="text-align: center; color: #cbd5e1; font-size: 10px;">
            Khwaja Fareed University of Engineering & Information Technology (KFUEIT)
          </p>
        </div>
      `;

      await transporter.sendMail({
        from,
        to: toEmail,
        subject: `UniMate KFUEIT — Your Verification Code is ${otpCode}`,
        text: `Your UniMate KFUEIT verification code is: ${otpCode}. Valid for 10 minutes.`,
        html: htmlContent,
      });

      console.log(`[UniMate Email] Successfully sent real verification code to ${toEmail}`);
      return { success: true };
    } catch (err: any) {
      console.error('[UniMate Email Error] Failed sending email via SMTP:', err);
      return { success: false, error: err?.message || 'Failed to dispatch email via SMTP.' };
    }
  }

  // If SMTP is not yet configured in .env.local, log prominently to terminal for development
  console.log(`
======================================================
📧 [UniMate Real Verification Code]
To: ${toEmail}
Name: ${studentName || 'Student'}
Code: ${otpCode}
(Configure SMTP_USER and SMTP_PASS in .env.local to deliver to inbox)
======================================================
  `);

  return { success: true };
}
