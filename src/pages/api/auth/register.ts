import type { APIRoute } from 'astro';
import { supabaseAuth, setSessionCookies } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const { email, password, name } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ success: false, error: 'E-Mail und Passwort sind erforderlich.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data, error } = await supabaseAuth.auth.signUp({ email, password });

  if (error || !data.user) {
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Registrierung fehlgeschlagen.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  await supabase.from('profiles').insert({
    id: data.user.id,
    name: name || null,
    email,
    plan: 'free'
  });

  if (data.session) {
    setSessionCookies(cookies, data.session);
    return new Response(JSON.stringify({ success: true, needsConfirmation: false }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true, needsConfirmation: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
