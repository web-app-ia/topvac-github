import { json, error, success } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'POST') return error('Méthode non autorisée', 405);

  const auth = request.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }

  return success({ message: 'Déconnecté' });
}
