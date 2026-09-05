import type { APIRoute } from 'astro';
import { getCurrentUser, supabaseAuth } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getCurrentUser(cookies);
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Nicht angemeldet.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { newPassword } = await request.json();

  if (!newPassword || newPassword.length < 6) {
    return new Response(
      JSON.stringify({ success: false, error: 'Das Passwort muss mindestens 6 Zeichen lang sein.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { error } = await supabaseAuth.auth.admin.updateUserById(user.id, { password: newPassword });

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
