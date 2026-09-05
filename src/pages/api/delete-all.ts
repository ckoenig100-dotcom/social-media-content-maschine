import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  const user = await getCurrentUser(cookies);
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Nicht angemeldet.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data, error } = await supabase
    .from('content_kalender')
    .delete()
    .eq('user_id', user.id)
    .neq('status', 'Veröffentlicht')
    .select('id');

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true, count: data?.length ?? 0 }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
