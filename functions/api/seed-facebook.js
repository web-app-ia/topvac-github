import { json, error, success, requireUser } from './_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'POST') return error('Méthode non autorisée', 405);

  const user = await requireUser(request, env);
  if (!user || user.email !== 'nikiemaguyjoel@gmail.com') return error('Non autorisé', 403);

  try {
    const resp = await fetch('https://www.topvacances.bf/facebook-ads.json');
    const data = await resp.json();
    const ads = (data.ads || []).slice(0, 100);
    let count = 0;
    for (const a of ads) {
      if (!a.page_name) continue;
      const desc = (a.creative_body || '') + (a.creative_title ? ' — ' + a.creative_title : '');
      const phoneMatch = desc.match(/(?:(\+226)\s*)?(\d{2}\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{2})/);
      const whatsapp = phoneMatch ? '+226' + phoneMatch[2].replace(/\s/g, '') : '';
      const id = a.id || ('fb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6));
      await env.DB.prepare(`INSERT OR REPLACE INTO publications (id, titre, page_name, description, image, creative_image_url, date, delivery_start_time, certifie, whatsapp, lien) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(id, a.page_name || '', a.page_name || '', desc, a.creative_image_url || '', a.creative_image_url || '', '', a.delivery_start_time || '', 0, whatsapp, a.lien || '').run();
      count++;
    }
    return success({ message: count + ' publications Facebook importées' });
  } catch (e) {
    return error('Erreur: ' + e.message, 500);
  }
}
