import { json, error, success, requireUser } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'POST') return error('Méthode non autorisée', 405);

  const user = await requireUser(request, env);
  if (!user) return error('Non authentifié', 401);

  const body = await request.json();
  const publicationId = body.publication_id;
  const files = body.files || [];

  if (!publicationId) return error('publication_id requis', 400);
  if (!files.length) return error('Aucun fichier fourni', 400);

  // Verify publication belongs to user
  const pub = await env.DB.prepare('SELECT id, auteur_id, image FROM publications WHERE id = ?').bind(publicationId).first();
  if (!pub) return error('Publication introuvable', 404);
  if (pub.auteur_id !== user.id) return error('Non autorisé', 403);

  var saved = [];
  var firstImageId = null;
  for (const f of files) {
    var fileId = 'f_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    await env.DB.prepare(
      'INSERT INTO publication_files (id, publication_id, type, data, filename) VALUES (?,?,?,?,?)'
    ).bind(fileId, publicationId, f.type || 'image', f.data, f.filename || '').run();
    saved.push({ id: fileId, type: f.type, filename: f.filename });
    if (!firstImageId && f.type !== 'video') firstImageId = fileId;
  }

  // Update image column with first uploaded image URL if not already set
  if (firstImageId && !pub.image) {
    const baseUrl = new URL(request.url).origin;
    await env.DB.prepare('UPDATE publications SET image = ? WHERE id = ?').bind(baseUrl + '/api/publications/file-data?id=' + firstImageId, publicationId).run();
  }

  return success({ files: saved });
}
