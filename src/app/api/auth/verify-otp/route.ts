import { NextResponse } from 'next/server';
import { verifyStoredOtp } from '@/lib/otp-store';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, profileData } = body;

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and verification code are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Verify against strictly stored OTP (NO bypass allowed)
    const verification = verifyStoredOtp(cleanEmail, cleanCode);
    if (!verification.valid) {
      return NextResponse.json({ success: false, error: verification.error || 'Invalid verification code.' }, { status: 400 });
    }

    // Code is 100% VALID and confirmed!
    const supabase = createClient();
    let studentId = crypto.randomUUID();

    if (supabase) {
      try {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingUser?.id) {
          studentId = existingUser.id;
        }
      } catch (e) {}
    }

    const profileRecord = {
      id: studentId,
      email: cleanEmail,
      full_name: profileData?.fullName || cleanEmail.split('@')[0],
      role: 'student',
      department_id: profileData?.departmentId || undefined,
      program: profileData?.program || 'BS Computer Science',
      semester: profileData?.semester ? Number(profileData.semester) : 1,
      student_id: profileData?.studentId || undefined,
      avatar_url: profileData?.avatarUrl || undefined,
      bio: `Verified student in ${profileData?.program || 'BS Computer Science'}.`,
      is_suspended: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('profiles').upsert(profileRecord);
      } catch (err) {
        console.warn('Profile sync notice:', err);
      }
    }

    return NextResponse.json({
      success: true,
      profile: profileRecord
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
