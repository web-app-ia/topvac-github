import { json, error, success, requireUser } from '../_utils.js';

export async function onRequest(context) {
  const { request, env, params } = context;
  if (request.method === 'OPTIONS') return json({}, 200);

  const user = await requireUser(request, env);
  if (!user) return error('Non authentifié', 401);

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM boites WHERE id = ? AND user_id = ?').bind(params.id, user.id).run();
    return success({ deleted: params.id });
  }

  return error('Méthode non autorisée', 405);
}