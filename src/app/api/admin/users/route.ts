import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, role, is_suspended } = body;

    if (!userId || !action) {
      return NextResponse.json({ success: false, error: 'User ID and action are required.' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      // Dev mode without service role key
      return NextResponse.json({ success: true, message: 'Local updated without Supabase service role.' });
    }

    if (action === 'toggle_suspension') {
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: Boolean(is_suspended), updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('[Admin Users API] Error updating suspension:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, is_suspended });
    }

    if (action === 'update_role') {
      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('[Admin Users API] Error updating role:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, role });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[Admin Users API] Unexpected error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
