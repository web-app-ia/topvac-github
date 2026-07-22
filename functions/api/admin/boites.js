import { json, error, success, requireUser } from '../_utils.js';

// Admin: liste toutes les boites + actions
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);

  const user = await requireUser(request, env);
  if (!user) return error('Non authentifié', 401);

  if (request.method === 'GET') {
    const all = await env.DB.prepare('SELECT * FROM boites ORDER BY created_at DESC').all();
    return success({ boites: all.results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    if (body.action === 'delete' && Array.isArray(body.ids)) {
      for (const id of body.ids) {
        await env.DB.prepare('DELETE FROM boites WHERE id = ?').bind(String(id)).run();
      }
      return success({ deleted: body.ids });
    }
    return error('Action non reconnue', 400);
  }

  return error('Méthode non autorisée', 405);
}
