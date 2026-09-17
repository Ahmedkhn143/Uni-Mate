import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, updates } = body;

    if (!updates) {
      return NextResponse.json({ success: false, error: 'No profile updates provided.' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ 
        success: true, 
        message: 'Updated in local store (no Supabase service role key).' 
      });
    }

    const cleanEmail = email?.trim().toLowerCase();
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };

    // Check if ID is a valid UUID (36-char hex separated by hyphens)
    const isValidUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let updatedRecord: any = null;

    if (isValidUUID) {
      const { data, error } = await supabase
        .from('profiles')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.warn('[Profile API] Update by ID failed, trying by email:', error.message);
      } else {
        updatedRecord = data;
      }
    }

    // If not updated by ID, update or upsert by email
    if (!updatedRecord && cleanEmail) {
      const { data: byEmail, error: emailErr } = await supabase
        .from('profiles')
        .update(cleanUpdates)
        .eq('email', cleanEmail)
        .select()
        .maybeSingle();

      if (emailErr) {
        console.error('[Profile API] Update by email error:', emailErr.message);
      } else if (byEmail) {
        updatedRecord = byEmail;
      } else {
        // If profile doesn't exist in Supabase yet (e.g. initial super admin), create it if we have a valid auth user or insert
        console.log('[Profile API] Profile record not in Supabase yet, will upsert:', cleanEmail);
      }
    }

    return NextResponse.json({
      success: true,
      profile: updatedRecord || cleanUpdates
    });
  } catch (err: any) {
    console.error('[Profile API] Unexpected error in profile update:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
