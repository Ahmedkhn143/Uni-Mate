import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Service role client not configured.' }, { status: 500 });
    }

    // 1. Fetch departments to resolve department names and codes
    const { data: depts } = await supabase.from('departments').select('id, name, code');
    const deptMap = new Map<string, { name: string; code: string }>();
    (depts || []).forEach((d) => deptMap.set(d.id, { name: d.name, code: d.code }));

    // 2. Fetch all profiles from public.profiles
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileErr) {
      console.error('[Admin Users API] Error querying profiles:', profileErr.message);
      return NextResponse.json({ success: false, error: profileErr.message }, { status: 500 });
    }

    // 3. Fetch all auth users to ensure no registered student is missed
    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
    
    const profileMap = new Map<string, any>();
    (profiles || []).forEach((p) => {
      const deptInfo = p.department_id ? deptMap.get(p.department_id) : null;
      const enriched = {
        ...p,
        reg_no: p.student_id || p.reg_no || 'Pending Assignment',
        student_id: p.student_id || p.reg_no || 'Pending Assignment',
        department_name: deptInfo?.name || (p.department_id === 'd1111111-1111-1111-1111-111111111111' ? 'Department of Computer Science & IT' : 'Academic Department'),
        department_code: deptInfo?.code || 'CS',
        program: p.program || 'BS Computer Science',
        semester: p.semester ? Number(p.semester) : 1
      };
      profileMap.set(p.email.toLowerCase(), enriched);
      profileMap.set(p.id, enriched);
    });

    // Cross-reference with auth users
    if (!authErr && authData?.users) {
      for (const u of authData.users) {
        if (!u.email) continue;
        const lowerEmail = u.email.toLowerCase();
        if (!profileMap.has(lowerEmail) && !profileMap.has(u.id)) {
          const userRoll = u.user_metadata?.reg_no || u.user_metadata?.student_id || 'Pending';
          const userProg = u.user_metadata?.program || 'BS Computer Science';
          const userSem = u.user_metadata?.semester ? Number(u.user_metadata.semester) : 1;
          const userDeptId = u.user_metadata?.department_id || null;
          const deptInfo = userDeptId ? deptMap.get(userDeptId) : null;

          const synthesized = {
            id: u.id,
            email: u.email,
            full_name: u.user_metadata?.full_name || u.email.split('@')[0],
            role: (u.user_metadata?.role as any) || 'student',
            department_id: userDeptId,
            department_name: deptInfo?.name || 'Department of Computer Science & IT',
            department_code: deptInfo?.code || 'CS',
            program: userProg,
            semester: userSem,
            student_id: userRoll,
            reg_no: userRoll,
            is_anonymous: false,
            avatar_url: u.user_metadata?.avatar_url || null,
            bio: `Registered student in ${userProg}.`,
            is_suspended: false,
            created_at: u.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Whitelist columns for PostgreSQL profiles table upsert
          const dbPayload = {
            id: synthesized.id,
            email: synthesized.email,
            full_name: synthesized.full_name,
            role: synthesized.role,
            department_id: synthesized.department_id,
            program: synthesized.program,
            semester: synthesized.semester,
            student_id: synthesized.student_id !== 'Pending' ? synthesized.student_id : null,
            avatar_url: synthesized.avatar_url,
            bio: synthesized.bio,
            is_suspended: synthesized.is_suspended,
            created_at: synthesized.created_at,
            updated_at: synthesized.updated_at
          };
          supabase.from('profiles').upsert(dbPayload).then(() => {});
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

    let targetId = userId.trim();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

    if (!isUUID) {
      // Search profile by email or student_id
      const { data: foundProfile } = await supabase
        .from('profiles')
        .select('id, email')
        .or(`email.eq.${targetId},student_id.eq.${targetId}`)
        .maybeSingle();

      if (foundProfile?.id) {
        targetId = foundProfile.id;
      } else {
        const { data: authList } = await supabase.auth.admin.listUsers();
        const foundAuth = authList?.users?.find((u) => u.email?.toLowerCase() === targetId.toLowerCase());
        if (foundAuth) targetId = foundAuth.id;
      }
    }

    // 1. Delete associated student data across all child tables
    await supabase.from('questions').delete().eq('author_id', targetId);
    await supabase.from('answers').delete().eq('author_id', targetId);
    await supabase.from('posts').delete().eq('author_id', targetId);
    await supabase.from('comments').delete().eq('author_id', targetId);
    await supabase.from('lost_found_items').delete().eq('author_id', targetId);
    await supabase.from('past_papers').delete().eq('uploader_id', targetId);
    await supabase.from('notifications').delete().eq('user_id', targetId);
    await supabase.from('reports').delete().eq('reporter_id', targetId);
    await supabase.from('bookmarks').delete().eq('user_id', targetId);

    // 2. Delete profile from public.profiles
    const { error: profileErr } = await supabase.from('profiles').delete().eq('id', targetId);
    if (profileErr) {
      console.error('[Admin Users API] Error deleting profile by id:', profileErr.message);
      // Also attempt delete by email if target is an email
      if (targetId.includes('@')) {
        await supabase.from('profiles').delete().eq('email', targetId.toLowerCase());
      }
    }

    // 3. Delete auth user from auth.users (triggers Postgres ON DELETE CASCADE)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)) {
      const { error: authErr } = await supabase.auth.admin.deleteUser(targetId);
      if (authErr) {
        console.warn('[Admin Users API] Error deleting auth user:', authErr.message);
      }
    }

    return NextResponse.json({ success: true, message: 'User permanently deleted from campus database' });
  } catch (err: any) {
    console.error('[Admin Users API] Error in DELETE:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

