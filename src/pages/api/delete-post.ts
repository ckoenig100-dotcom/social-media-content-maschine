import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();

  const { data, error } = await supabase
    .from('content_kalender')
    .delete()
    .eq('id', id)
    .neq('status', 'Veröffentlicht')
    .select('id');

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!data || data.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: 'Veröffentlichte Posts können nicht gelöscht werden.' }),
      { status: 409, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
