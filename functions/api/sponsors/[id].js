import { json, error, success, requireUser } from '../_utils.js';

export async function onRequest(context) {
  const { request, env, params } = context;
  if (request.method === 'OPTIONS') return json({}, 200);

  const user = await requireUser(request, env);
  if (!user) return error('Non authentifié', 401);

  if (request.method === 'PUT') {
    const body = await request.json();
    await env.DB.prepare('UPDATE sponsors SET url=?, type=? WHERE id=?').bind(body.url || '', body.type || 'image', params.id).run();
    return success({ sponsor: { id: params.id, ...body } });
  }

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM sponsors WHERE id = ?').bind(params.id).run();
    return success({ deleted: params.id });
  }

  return error('Méthode non autorisée', 405);
}