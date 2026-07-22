import { json, error, success, requireUser } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'GET') return error('Méthode non autorisée', 405);

  const user = await requireUser(request, env);
  if (!user) return error('Non authentifié', 401);

  const url = new URL(request.url);
  const publicationId = url.searchParams.get('publication_id');

  if (!publicationId) return error('publication_id requis', 400);

  const all = await env.DB.prepare(
    'SELECT id, publication_id, type, data, filename, created_at FROM publication_files WHERE publication_id = ? ORDER BY created_at ASC'
  ).bind(publicationId).all();

  // Remap to include full data for direct display in admin
  var files = (all.results || []).map(function(f) {
    return { id: f.id, publication_id: f.publication_id, type: f.type, filename: f.filename, data: f.data, created_at: f.created_at };
  });

  return success({ files: files });
}
