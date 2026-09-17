import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, updates } = body;

    if (!updates) {
      return NextResponse.json({ success: false, error: 'No profile updates provided.' }, { status: 400 });
    }

    const cleanEmail = email?.trim().toLowerCase();

    // Whitelist and map ONLY columns that exist in the Supabase 'profiles' table:
    // Available schema columns: id, email, full_name, role, department_id, program, semester, student_id, avatar_url, bio, is_suspended, updated_at
    const dbPayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.full_name !== undefined) dbPayload.full_name = String(updates.full_name).trim();
    if (updates.program !== undefined) dbPayload.program = String(updates.program).trim();
    if (updates.semester !== undefined) dbPayload.semester = updates.semester ? Number(updates.semester) : null;
    if (updates.department_id !== undefined) dbPayload.department_id = updates.department_id;
    if (updates.avatar_url !== undefined) dbPayload.avatar_url = updates.avatar_url;
    if (updates.bio !== undefined) dbPayload.bio = String(updates.bio).trim();
    if (updates.reg_no !== undefined || updates.student_id !== undefined) {
      dbPayload.student_id = String(updates.reg_no || updates.student_id).trim();
    }
    if (updates.role !== undefined) dbPayload.role = updates.role;
    if (updates.is_suspended !== undefined) dbPayload.is_suspended = Boolean(updates.is_suspended);

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ 
        success: true, 
        profile: { ...updates, ...dbPayload, reg_no: updates.reg_no, is_anonymous: updates.is_anonymous ?? false },
        message: 'Updated in local store (no Supabase service role key).' 
      });
    }

    const isValidUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let updatedRecord: any = null;

    // 1. Try update by valid UUID
    if (isValidUUID) {
      const { data, error } = await supabase
        .from('profiles')
        .update(dbPayload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (!error && data) {
        updatedRecord = data;
      }
    }

    // 2. If not updated by ID, update by email
    if (!updatedRecord && cleanEmail) {
      const { data: byEmail, error: emailErr } = await supabase
        .from('profiles')
        .update(dbPayload)
        .eq('email', cleanEmail)
        .select()
        .maybeSingle();

      if (!emailErr && byEmail) {
        updatedRecord = byEmail;
      }
    }

    const returnProfile = {
      ...updates,
      ...(updatedRecord || dbPayload),
      reg_no: updatedRecord?.student_id || updates.reg_no,
      student_id: updatedRecord?.student_id || updates.reg_no,
      is_anonymous: updates.is_anonymous ?? false
    };

    return NextResponse.json({
      success: true,
      profile: returnProfile
    });
  } catch (err: any) {
    console.error('[Profile API] Unexpected error in profile update:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
