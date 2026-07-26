import { json, error, success, requireUser } from '../_utils.js';

export async function onRequest(context) {
  const { request, env, params } = context;
  const id = params.id;

  if (request.method === 'OPTIONS') return json({}, 200);

  if (request.method === 'GET') {
    const pub = await env.DB.prepare('SELECT * FROM publications WHERE id = ?').bind(id).first();
    if (!pub) return error('Publication introuvable', 404);
    return success({ ad: pub });
  }

  if (request.method === 'PUT') {
    const user = await requireUser(request, env);
    if (!user) return error('Non authentifié', 401);
    const body = await request.json();
    // Partial update: only fields present in body are updated
    var sets = [];
    var vals = [];
    var fields = ['titre','page_name','description','image','creative_image_url','tags','date','delivery_start_time','lien','certifie','whatsapp','prix','lieu','facebook','tiktok','site_web','hero','promoteur','texte_publication','accessibilite','payment_phone'];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (body[f] !== undefined) {
        sets.push(f + '=?');
        if (f === 'tags') {
          vals.push(JSON.stringify(body[f] || []));
        } else if (f === 'certifie' || f === 'hero') {
          vals.push(body[f] ? 1 : 0);
        } else {
          vals.push(body[f] || '');
        }
      }
    }
    if (sets.length) {
      sets.push("updated_at=datetime('now')");
      await env.DB.prepare('UPDATE publications SET ' + sets.join(',') + ' WHERE id=?').bind(...vals, id).run();
    }
    return success({ ad: { id, ...body } });
  }

  if (request.method === 'DELETE') {
    const user = await requireUser(request, env);
    if (!user) return error('Non authentifié', 401);
    await env.DB.prepare('DELETE FROM publications WHERE id = ?').bind(id).run();
    return success({ deleted: id });
  }

  return error('Méthode non autorisée', 405);
}