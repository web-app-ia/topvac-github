import { json, error, success, requireUser } from './_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);

  const user = await requireUser(request, env);
  if (!user) return error('Non authentifié', 401);

  if (request.method === 'GET') {
    const all = await env.DB.prepare('SELECT * FROM boites WHERE user_id = ? ORDER BY created_at DESC').bind(user.id).all();
    return success({ boites: all.results });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const id = 'boite_' + Date.now();
    await env.DB.prepare('INSERT INTO boites (id, user_id, nom, filters) VALUES (?,?,?,?)').bind(id, user.id, body.nom || '', JSON.stringify(body.filters || {})).run();
    return success({ boite: { id, nom: body.nom, filters: body.filters, user_id: user.id } });
  }

  return error('Méthode non autorisée', 405);
}
