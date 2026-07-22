import { json, error, requireUser } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'GET') return error('Méthode non autorisée', 405);

  const user = await requireUser(request, env);
  if (!user) return error('Non authentifié', 401);

  const url = new URL(request.url);
  const fileId = url.searchParams.get('id');
  if (!fileId) return error('id requis', 400);

  const file = await env.DB.prepare('SELECT id, type, data, filename FROM publication_files WHERE id = ?').bind(fileId).first();
  if (!file) return error('Fichier introuvable', 404);

  // Extract base64 data (remove data:...;base64, prefix)
  var b64 = file.data;
  var mime = file.type === 'video' ? 'video/mp4' : 'image/jpeg';
  var comma = b64.indexOf(',');
  if (comma !== -1) {
    var header = b64.slice(0, comma);
    var mimeMatch = header.match(/data:([^;]+);/);
    if (mimeMatch) mime = mimeMatch[1];
    b64 = b64.slice(comma + 1);
  }

  var binary = Uint8Array.from(atob(b64), function(c) { return c.charCodeAt(0); });
  return new Response(binary, {
    headers: {
      'Content-Type': mime,
      'Content-Disposition': 'inline; filename="' + (file.filename || 'file') + '"',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
