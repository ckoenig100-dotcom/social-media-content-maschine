import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { id, status, geplant_fuer } = await request.json();

  const update: Record<string, unknown> = {};
  if (status !== undefined) update.status = status;
  if (geplant_fuer !== undefined) update.geplant_fuer = geplant_fuer;

  const { error } = await supabase
    .from('content_kalender')
    .update(update)
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
