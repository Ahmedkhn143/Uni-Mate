import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Service role client not configured.' }, { status: 500 });
    }

    // 1. Fetch all profiles from public.profiles
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileErr) {
      console.error('[Admin Users API] Error querying profiles:', profileErr.message);
      return NextResponse.json({ success: false, error: profileErr.message }, { status: 500 });
    }

    // 2. Fetch all auth users to ensure no registered student is missed
    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
    
    const profileMap = new Map<string, any>();
    (profiles || []).forEach((p) => {
      profileMap.set(p.email.toLowerCase(), p);
      profileMap.set(p.id, p);
    });

    // Cross-reference with auth users
    if (!authErr && authData?.users) {
      for (const u of authData.users) {
        if (!u.email) continue;
        const lowerEmail = u.email.toLowerCase();
        if (!profileMap.has(lowerEmail) && !profileMap.has(u.id)) {
          const synthesized = {
            id: u.id,
            email: u.email,
            full_name: u.user_metadata?.full_name || u.email.split('@')[0],
            role: (u.user_metadata?.role as any) || 'student',
            department_id: null,
            program: 'Degree Student',
            semester: 1,
            student_id: null,
            reg_no: null,
            is_anonymous: false,
            avatar_url: null,
            bio: null,
            is_suspended: false,
            created_at: u.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          // Insert missing profile record asynchronously
          supabase.from('profiles').upsert(synthesized).then(() => {});
          profileMap.set(lowerEmail, synthesized);
        }
      }
    }

    // Deduplicate profiles by email
    const uniqueProfiles = Array.from(new Set(Array.from(profileMap.values()).map(p => p.email.toLowerCase())))
      .map(email => profileMap.get(email));

    return NextResponse.json({
      success: true,
      users: uniqueProfiles,
      total: uniqueProfiles.length
    });
  } catch (err: any) {
    console.error('[Admin Users API] Error in GET:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch users' }, { status: 500 });
  }
}

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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Local updated without Supabase service role.' });
    }

    // 1. Delete associated data to prevent foreign key issues
    await supabase.from('questions').delete().eq('author_id', userId);
    await supabase.from('answers').delete().eq('author_id', userId);
    await supabase.from('posts').delete().eq('author_id', userId);
    await supabase.from('comments').delete().eq('author_id', userId);
    await supabase.from('lost_found_items').delete().eq('author_id', userId);
    await supabase.from('past_papers').delete().eq('uploader_id', userId);
    await supabase.from('notifications').delete().eq('user_id', userId);
    await supabase.from('reports').delete().eq('reporter_id', userId);
    await supabase.from('bookmarks').delete().eq('user_id', userId);

    // 2. Delete profile
    const { error: profileErr } = await supabase.from('profiles').delete().eq('id', userId);
    if (profileErr) {
      console.error('[Admin Users API] Error deleting profile:', profileErr.message);
    }

    // 3. Delete auth user
    const { error: authErr } = await supabase.auth.admin.deleteUser(userId);
    if (authErr) {
      console.warn('[Admin Users API] Error deleting auth user:', authErr.message);
    }

    return NextResponse.json({ success: true, message: 'User permanently deleted' });
  } catch (err: any) {
    console.error('[Admin Users API] Error in DELETE:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

