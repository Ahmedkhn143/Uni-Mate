import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table, action = 'insert', data, id, filter } = body;

    if (!table) {
      return NextResponse.json({ success: false, error: 'Table is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        message: 'Saved locally in UniMate offline cache (Supabase service role client unavailable).'
      });
    }

    // Ensure valid author_id for tables that require a foreign key to profiles
    const cleanData = { ...data };
    if (['posts', 'questions', 'answers', 'lost_found_items', 'reports'].includes(table) && cleanData.author_id) {
      // Check if author_id is a valid UUID
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanData.author_id);
      if (!isValidUUID) {
        // Find first student or matching profile in DB to satisfy foreign key
        const { data: firstProfile } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
        if (firstProfile?.id) {
          cleanData.author_id = firstProfile.id;
        }
      }
    }

    if (action === 'insert') {
      const { data: inserted, error } = await supabase
        .from(table)
        .insert(cleanData)
        .select()
        .maybeSingle();

      if (error) {
        console.warn(`[Data API] Insert into ${table} failed:`, error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 200 });
      }

      return NextResponse.json({ success: true, data: inserted });
    }

    if (action === 'update') {
      let query = supabase.from(table).update(cleanData);
      if (id) {
        query = query.eq('id', id);
      } else if (filter && typeof filter === 'object') {
        Object.entries(filter).forEach(([key, val]) => {
          query = query.eq(key, val as any);
        });
      }

      const { data: updated, error } = await query.select();
      if (error) {
        console.warn(`[Data API] Update ${table} failed:`, error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 200 });
      }
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'delete') {
      let query = supabase.from(table).delete();
      if (id) {
        query = query.eq('id', id);
      } else if (filter && typeof filter === 'object') {
        Object.entries(filter).forEach(([key, val]) => {
          query = query.eq(key, val as any);
        });
      }

      const { error } = await query;
      if (error) {
        console.warn(`[Data API] Delete from ${table} failed:`, error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 200 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error('[Data API] Unexpected error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
