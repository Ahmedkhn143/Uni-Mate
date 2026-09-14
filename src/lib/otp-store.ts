// In-memory OTP storage with 10-minute expiry
interface OtpRecord {
  code: string;
  expiresAt: number;
}

// Global cache object so it persists across Next.js API requests in development
const globalForOtp = globalThis as unknown as {
  otpStore?: Map<string, OtpRecord>;
};

export const otpStore = globalForOtp.otpStore ?? new Map<string, OtpRecord>();

if (process.env.NODE_ENV !== 'production') {
  globalForOtp.otpStore = otpStore;
}

export function saveOtp(email: string, code: string): void {
  const cleanEmail = email.trim().toLowerCase();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(cleanEmail, { code, expiresAt });
}

export function verifyStoredOtp(email: string, enteredCode: string): { valid: boolean; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const record = otpStore.get(cleanEmail);

  if (!record) {
    return { valid: false, error: 'No verification code found. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return { valid: false, error: 'Verification code has expired. Please request a new code.' };
  }

  if (record.code.trim() !== enteredCode.trim()) {
    return { valid: false, error: 'Incorrect verification code. Please check the code sent to your email.' };
  }

  // Once verified, delete it to prevent replay
  otpStore.delete(cleanEmail);
  return { valid: true };
}
