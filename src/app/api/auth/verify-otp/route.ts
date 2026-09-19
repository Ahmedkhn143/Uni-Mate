import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { verifyStoredOtp } from '@/lib/otp-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, profileData } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and verification code are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // ----------------------------------------------------------------
    // Step 1: Verify the OTP code
    // Primary: check Supabase otp_codes table (works on serverless/Vercel)
    // Fallback: check in-memory store (dev only)
    // ----------------------------------------------------------------
    const supabase = createServiceRoleClient();
    let otpIsValid = false;
    let otpError = 'Invalid or expired verification code.';

    if (supabase) {
      const { data: otpRecord, error: fetchErr } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('email', cleanEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchErr) {
        console.error('[UniMate OTP] Error fetching OTP from Supabase:', fetchErr.message);
      }

      if (!otpRecord) {
        otpError = 'No verification code found. Please request a new code.';
      } else if (new Date(otpRecord.expires_at) < new Date()) {
        // OTP expired — clean it up
        await supabase.from('otp_codes').delete().eq('id', otpRecord.id);
        otpError = 'Verification code has expired. Please request a new code.';
      } else if (otpRecord.code.trim() !== cleanCode) {
        otpError = 'Incorrect verification code. Please check the code sent to your email.';
      } else {
        // ✅ OTP is valid — delete it to prevent replay attacks
        await supabase.from('otp_codes').delete().eq('id', otpRecord.id);
        otpIsValid = true;
      }
    } else {
      // Fallback to in-memory store (local dev without service role key)
      console.warn('[UniMate OTP] Service role client unavailable, falling back to in-memory OTP store.');
      const result = verifyStoredOtp(cleanEmail, cleanCode);
      otpIsValid = result.valid;
      if (!result.valid) otpError = result.error || otpError;
    }

    if (!otpIsValid) {
      return NextResponse.json({ success: false, error: otpError }, { status: 400 });
    }

    // ----------------------------------------------------------------
    // Step 2: Create verified user in Supabase Auth using Admin API
    // This creates a user in auth.users with email_confirmed = true,
    // so the student can log in immediately without a confirmation loop.
    // ----------------------------------------------------------------
    if (!supabase) {
      // No service role — we cannot create auth users. Return a partial success
      // so the client can still log in using signInWithPassword if the user
      // already exists (e.g., in local dev).
      const partialProfile = {
        id: crypto.randomUUID(),
        email: cleanEmail,
        full_name: profileData?.fullName || cleanEmail.split('@')[0],
        role: 'student' as const,
        department_id: profileData?.departmentId || null,
        program: profileData?.program || 'BS Computer Science',
        semester: profileData?.semester ? Number(profileData.semester) : 1,
        reg_no: profileData?.regNo || null,
        is_anonymous: profileData?.isAnonymous ?? false,
        student_id: profileData?.studentId || profileData?.regNo || null,
        is_suspended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      console.warn(
        '[UniMate] SUPABASE_SERVICE_ROLE_KEY not set. User creation skipped. ' +
        'Please add the service role key to .env.local for full functionality.'
      );
      return NextResponse.json({ success: true, profile: partialProfile });
    }

    const studentPassword = profileData?.password || 'KFUEITStudent2026!';

    // Check if this user already exists in Supabase Auth
    let authUserId: string | null = null;

    const { data: { users: existingUsers }, error: listErr } =
      await supabase.auth.admin.listUsers();

    if (!listErr && existingUsers) {
      const existingUser = existingUsers.find(
        (u) => u.email?.toLowerCase() === cleanEmail
      );
      if (existingUser) {
        authUserId = existingUser.id;
        // Update password in case user is re-registering
        await supabase.auth.admin.updateUserById(authUserId, {
          password: studentPassword,
          email_confirm: true,
        });
      }
    }

    if (!authUserId) {
      // Create brand-new verified user
      const { data: newAuthUser, error: createErr } =
        await supabase.auth.admin.createUser({
          email: cleanEmail,
          password: studentPassword,
          email_confirm: true, // Skip confirmation email — we already verified via OTP
          user_metadata: {
            full_name: profileData?.fullName || cleanEmail.split('@')[0],
            role: 'student',
          },
        });

      if (createErr || !newAuthUser?.user) {
        // If createUser failed because user already exists, lookup and update
        const { data: listRes } = await supabase.auth.admin.listUsers();
        const existing = listRes?.users?.find(
          (u) => u.email?.toLowerCase() === cleanEmail
        );
        if (existing) {
          authUserId = existing.id;
          await supabase.auth.admin.updateUserById(authUserId, {
            password: studentPassword,
            email_confirm: true,
          });
        } else {
          console.error('[UniMate Auth] Failed to create auth user:', createErr?.message);
          return NextResponse.json(
            {
              success: false,
              error:
                'Failed to create your university account: ' +
                (createErr?.message || 'Unknown auth error') +
                '. Please try again.',
            },
            { status: 500 }
          );
        }
      } else {
        authUserId = newAuthUser.user.id;
      }
    }

    // ----------------------------------------------------------------
    // Step 3: Upsert the student profile in public.profiles
    // Using the REAL auth.users UUID so RLS works correctly for all
    // future database operations.
    // ----------------------------------------------------------------
    // Validate UUID format so Postgres doesn't reject custom strings
    const isUUID = (val?: string | null) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));
    const safeDeptId = isUUID(profileData?.departmentId) ? profileData!.departmentId : null;
    const studentRegNo = (profileData?.regNo || profileData?.studentId || '').trim();

    // Whitelist ONLY columns that physically exist in the Supabase 'profiles' table
    const profileRecord = {
      id: authUserId,
      email: cleanEmail,
      full_name: profileData?.fullName || cleanEmail.split('@')[0],
      role: 'student',
      department_id: safeDeptId,
      program: profileData?.program || 'BS Computer Science',
      semester: profileData?.semester ? Number(profileData.semester) : 1,
      student_id: studentRegNo || null,
      avatar_url: profileData?.avatarUrl || null,
      bio: `Verified student in ${profileData?.program || 'BS Computer Science'}.`,
      is_suspended: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert(profileRecord, { onConflict: 'id' });

    if (profileErr) {
      console.error('[UniMate Profile] Failed to upsert profile:', profileErr.message);
      // Try direct update as fallback in case row was created by auth trigger
      await supabase
        .from('profiles')
        .update({
          full_name: profileRecord.full_name,
          department_id: profileRecord.department_id,
          program: profileRecord.program,
          semester: profileRecord.semester,
          student_id: profileRecord.student_id,
          bio: profileRecord.bio,
          avatar_url: profileRecord.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUserId);
    }

    console.log(
      `[UniMate] Successfully registered and verified student: ${cleanEmail} (auth_id: ${authUserId})`
    );

    const fullProfile = {
      ...profileRecord,
      reg_no: studentRegNo || null,
      is_anonymous: profileData?.isAnonymous ?? false
    };

    return NextResponse.json({
      success: true,
      profile: fullProfile,
    });
  } catch (err: any) {
    console.error('[UniMate OTP] Unexpected error in verify-otp:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
