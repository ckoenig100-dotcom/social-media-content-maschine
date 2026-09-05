import type { APIRoute } from 'astro';
import { getCurrentUser } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getCurrentUser(cookies);
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Nicht angemeldet.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { name, phone, avatarBase64, avatarType } = await request.json();

  let avatarUrl: string | undefined;

  if (avatarBase64 && avatarType) {
    const buffer = Buffer.from(avatarBase64, 'base64');
    const ext = avatarType.split('/')[1] || 'jpg';
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, buffer, { contentType: avatarType, upsert: true });

    if (uploadError) {
      return new Response(JSON.stringify({ success: false, error: uploadError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
    avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
  }

  const update: Record<string, unknown> = { name, phone };
  if (avatarUrl) update.avatar_url = avatarUrl;

  const { error } = await supabase.from('profiles').update(update).eq('id', user.id);

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true, avatarUrl }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
