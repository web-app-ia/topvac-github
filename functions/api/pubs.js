import { json, error, success, requireUser } from './_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') return json({}, 200);

  if (request.method === 'GET') {
    const typeFilter = url.searchParams.get('type') || '';
    const sql = typeFilter ? 'SELECT * FROM publications WHERE type = ? ORDER BY date DESC' : 'SELECT * FROM publications ORDER BY date DESC';
    const params = typeFilter ? [typeFilter] : [];
    const all = await env.DB.prepare(sql).bind(...params).all();
    var ads = (all.results || []).map(function(p) {
      var desc = p.description || '';
      try {
        var parsed = JSON.parse(desc);
        if (parsed.text) desc = parsed.text;
        else if (typeof parsed === 'object') {
          var parts = [];
          if (parsed.categorie) parts.push(parsed.categorie);
          if (parsed.ville) parts.push(parsed.ville);
          if (parsed.type) parts.push(parsed.type);
          desc = parts.join(' — ') || desc;
        }
      } catch(e) {}
      return { ...p, description: desc, certifie: !!p.certifie, hero: !!p.hero };
    });
    return success({ ads });
  }

  if (request.method === 'POST') {
    const user = await requireUser(request, env);
    if (!user) return error('Non authentifié', 401);
    const body = await request.json();
    const id = body.id || 'pub_' + Date.now();
    await env.DB.prepare(`INSERT INTO publications (id, titre, page_name, description, image, creative_image_url, tags, date, delivery_start_time, lien, certifie, whatsapp, prix, lieu, hero, auteur_id, type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id, body.titre || '', body.page_name || '', body.description || '', body.image || '', body.creative_image_url || '', JSON.stringify(body.tags || []), body.date || '', body.delivery_start_time || '', body.lien || '', body.certifie ? 1 : 0, body.whatsapp || '', body.prix || '', body.lieu || '', body.hero ? 1 : 0, user.id, body.type || 'activities').run();
    return success({ ad: { id, ...body } });
  }

  return error('Méthode non autorisée', 405);
}
