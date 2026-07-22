// Server-side cart persistence for authenticated users.
// Carts are stored in D1 (table cart_items) and follow the user across devices.

import { json, error, success, requireUser } from './_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') return json({}, 200);

  const user = await requireUser(request, env);
  if (!user) return error('Non authentifié', 401);

  // GET /api/cart → liste des articles du panier de l'utilisateur
  if (request.method === 'GET') {
    const rows = await env.DB.prepare(
      'SELECT ad_id, ad_data, created_at FROM cart_items WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(user.id).all();

    const items = (rows.results || []).map(function(r) {
      let data = {};
      try { data = JSON.parse(r.ad_data || '{}'); } catch (e) { data = {}; }
      return Object.assign({ id: r.ad_id }, data);
    });

    return success({ items: items });
  }

  // POST /api/cart { id, ...adData } → upsert (ajout ou mise à jour)
  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch (e) { return error('JSON invalide', 400); }

    const adId = body.id || body.ad_id;
    if (!adId) return error('id manquant', 400);

    const adData = {
      titre: body.titre || body.page_name || 'Activité',
      image: body.image || body.creative_image_url || '',
      description: (body.description || '').slice(0, 100),
      prix: body.prix || '',
      lieu: body.lieu || '',
      whatsapp: body.whatsapp || ''
    };

    await env.DB.prepare(
      `INSERT INTO cart_items (user_id, ad_id, ad_data) VALUES (?, ?, ?)
       ON CONFLICT(user_id, ad_id) DO UPDATE SET ad_data = excluded.ad_data`
    ).bind(user.id, String(adId), JSON.stringify(adData)).run();

    return success({ item: Object.assign({ id: String(adId) }, adData) });
  }

  // DELETE /api/cart?id=xxx → retirer un article
  // DELETE /api/cart          → vider tout le panier
  if (request.method === 'DELETE') {
    const adId = url.searchParams.get('id');
    if (adId) {
      await env.DB.prepare(
        'DELETE FROM cart_items WHERE user_id = ? AND ad_id = ?'
      ).bind(user.id, String(adId)).run();
      return success({ removed: String(adId) });
    } else {
      await env.DB.prepare(
        'DELETE FROM cart_items WHERE user_id = ?'
      ).bind(user.id).run();
      return success({ cleared: true });
    }
  }

  return error('Méthode non autorisée', 405);
}
