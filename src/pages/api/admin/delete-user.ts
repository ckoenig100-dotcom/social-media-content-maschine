import type { APIRoute } from 'astro';
import { getCurrentUser, supabaseAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getCurrentUser(cookies);
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Nicht angemeldet.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: caller } = await supabase
    .from('profiles')
    .select('is_admin, is_superadmin')
    .eq('id', user.id)
    .single();

  if (!caller?.is_admin) {
    return new Response(JSON.stringify({ success: false, error: 'Kein Admin-Zugriff.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { userId } = await request.json();

  if (userId === user.id) {
    return new Response(JSON.stringify({ success: false, error: 'Du kannst dich nicht selbst löschen.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: target } = await supabase.from('profiles').select('is_admin').eq('id', userId).single();

  if (target?.is_admin && !caller.is_superadmin) {
    return new Response(
      JSON.stringify({ success: false, error: 'Nur der Superadmin kann Admin-Accounts löschen.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { error } = await supabaseAuth.auth.admin.deleteUser(userId);

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
