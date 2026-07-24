import { json, error, success, requireUser } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'POST') return error('Méthode non autorisée', 405);

  const user = await requireUser(request, env);
  if (!user) return error('Non authentifié', 401);

  const body = await request.json();
  const pubId = body.id;
  if (!pubId) return error('ID publication manquant', 400);

  const pub = await env.DB.prepare('SELECT * FROM publications WHERE id = ? AND auteur_id = ?').bind(pubId, user.id).first();
  if (!pub) return error('Publication introuvable ou accès refusé', 404);

  var desc = {};
  try { desc = JSON.parse(pub.description || '{}'); } catch(e) { desc = {}; }
  if (!desc.meta) desc.meta = {};
  desc.meta.delete_requested = new Date().toISOString();

  await env.DB.prepare('UPDATE publications SET description = ?, certifie = -1 WHERE id = ?').bind(JSON.stringify(desc), pubId).run();

  return success({ message: 'Demande de suppression enregistrée' });
}
