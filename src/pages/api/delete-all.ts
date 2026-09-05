import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async () => {
  const { data, error } = await supabase
    .from('content_kalender')
    .delete()
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
