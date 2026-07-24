import { json, error, success, requireUser, getUserFromRequest } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') return json({}, 200);

  if (request.method === 'GET') {
    const user = await getUserFromRequest(request, env);
    const all = await env.DB.prepare(
      user
        ? 'SELECT * FROM publications WHERE auteur_id = ? ORDER BY created_at DESC'
        : 'SELECT * FROM publications ORDER BY created_at DESC'
    ).bind(...(user ? [user.id] : [])).all();
    const publications = (all.results || []).map(function(p) {
      return {
        ...p,
        certifie: !!p.certifie,
        hero: !!p.hero,
        status: p.certifie ? 'certifie' : 'en_attente',
        tags: (function(t) { try { return JSON.parse(t); } catch(e) { return []; } })(p.tags)
      };
    });
    return json({ success: true, publications });
  }

  if (request.method === 'POST') {
    const user = await requireUser(request, env);
    if (!user) return error('Non authentifié', 401);
    const body = await request.json();
    const id = body.id || 'sub_' + Date.now();
    const date = body.date || new Date().toISOString().split('T')[0];
    const pubType = body.type || 'activities';
    const revendiqueId = body.revendique_id || null;
    const metaType = revendiqueId ? 'revendiquer' : pubType;
    var descMeta = {
      categorie: body.categorie || '',
      budget_min: body.budget_min || '',
      budget_max: body.budget_max || '',
      age_min: body.age_min || '',
      age_max: body.age_max || '',
      niveau_scolaire: body.niveau_scolaire || '',
      access: body.access || [],
      ville: body.ville || '',
      arrond: body.arrond || '',
      secteur: body.secteur || '',
      quartier: body.quartier || '',
      horaires: body.horaires || [],
      jours: body.jours || [],
      start_date: body.start_date || '',
      end_date: body.end_date || '',
      status: body.status || 'en_attente',
      type: metaType,
      formule: body.formule || 'normal',
      nb_lots: body.nb_lots || 1,
      sponsored_position: body.sponsored_position || null,
      montant: body.montant || 0
    };
    if (revendiqueId) descMeta.revendique_id = revendiqueId;
    var plainDesc = body.texte_publication || body.activity_name || '';
    if (body.categorie) plainDesc += ' — ' + body.categorie;
    if (body.ville) plainDesc += ' — ' + body.ville;
    await env.DB.prepare(
      `INSERT INTO publications (id, titre, page_name, activity_name, description, date, lien, certifie, whatsapp, prix, lieu, image, auteur_id, type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      id,
      body.promoteur || body.titre || body.page_name || 'Soumission #' + id,
      body.page_name || '',
      body.activity_name || '',
      JSON.stringify({ meta: descMeta, text: plainDesc, promoteur: body.promoteur || '', texte_publication: body.texte_publication || '' }),
      date,
      body.lien || '',
      0,
      body.whatsapp || '',
      body.prix || '',
      body.lieu || '',
      body.image || '',
      user.id,
      pubType
    ).run();
    return success({ publication: { id, ...body, status: 'en_attente', created_at: new Date().toISOString() } });
  }

  return error('Méthode non autorisée', 405);
}
