import { json, error, success, requireUser } from '../_utils.js';

export async function onRequest(context) {
  const { request, env, params } = context;
  const id = params.id;

  if (request.method === 'OPTIONS') return json({}, 200);

  if (request.method === 'GET') {
    const pub = await env.DB.prepare('SELECT * FROM publications WHERE id = ?').bind(id).first();
    if (!pub) return error('Publication introuvable', 404);
    return success({ ad: pub });
  }

  if (request.method === 'PUT') {
    const user = await requireUser(request, env);
    if (!user) return error('Non authentifié', 401);
    const body = await request.json();
    await env.DB.prepare(`UPDATE publications SET titre=?, page_name=?, description=?, image=?, creative_image_url=?, tags=?, date=?, delivery_start_time=?, lien=?, certifie=?, whatsapp=?, prix=?, lieu=?, facebook=?, tiktok=?, site_web=?, hero=?, updated_at=datetime('now') WHERE id=?`).bind(body.titre || '', body.page_name || '', body.description || '', body.image || '', body.creative_image_url || '', JSON.stringify(body.tags || []), body.date || '', body.delivery_start_time || '', body.lien || '', body.certifie ? 1 : 0, body.whatsapp || '', body.prix || '', body.lieu || '', body.facebook || '', body.tiktok || '', body.site_web || '', body.hero ? 1 : 0, id).run();
    return success({ ad: { id, ...body } });
  }

  if (request.method === 'DELETE') {
    const user = await requireUser(request, env);
    if (!user) return error('Non authentifié', 401);
    await env.DB.prepare('DELETE FROM publications WHERE id = ?').bind(id).run();
    return success({ deleted: id });
  }

  return error('Méthode non autorisée', 405);
}