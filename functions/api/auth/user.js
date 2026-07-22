import { json, error, success } from '../_utils.js';
import { getUserFromRequest } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'GET') return error('Méthode non autorisée', 405);

  const user = await getUserFromRequest(request, env);
  if (!user) return error('Non authentifié', 401);

  return success({ user });
}
