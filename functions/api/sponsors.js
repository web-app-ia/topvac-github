import { json, error, success, requireUser } from './_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);

  if (request.method === 'GET') {
    const all = await env.DB.prepare('SELECT * FROM sponsors ORDER BY created_at DESC').all();
    return success({ sponsors: all.results });
  }

  if (request.method === 'POST') {
    const user = await requireUser(request, env);
    if (!user) return error('Non authentifié', 401);
    const body = await request.json();
    const id = 'sp_' + Date.now();
    await env.DB.prepare('INSERT INTO sponsors (id, url, type) VALUES (?,?,?)').bind(id, body.url || '', body.type || 'image').run();
    return success({ sponsor: { id, url: body.url, type: body.type } });
  }

  return error('Méthode non autorisée', 405);
}
