import { json, error, success, requireUser } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'POST') return error('Methode non autorisee', 405);

  const user = await requireUser(request, env);
  if (!user) return error('Non authentifie', 401);

  const body = await request.json();
  const originalId = body.original_id;
  if (!originalId) return error('original_id requis', 400);

  const original = await env.DB.prepare('SELECT * FROM publications WHERE id = ?').bind(originalId).first();
  if (!original) return error('Publication originale introuvable', 404);
  if (original.auteur_id !== user.id) return error('Acces refuse', 403);

  const id = 'mod_' + Date.now();
  const date = body.date || new Date().toISOString().split('T')[0];
  const pubType = body.type || 'activities';

  var descMeta = {
    modification_of: originalId,
    modification_status: 'pending',
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
    status: 'modification_pending',
    type: 'modification',
    formule: body.formule || 'normal',
    nb_lots: body.nb_lots || 1,
    sponsored_position: body.sponsored_position || null,
    montant: body.montant || 0
  };

  if (body.revendique_id) descMeta.revendique_id = body.revendique_id;

  var plainDesc = body.texte_publication || body.activity_name || '';
  if (body.categorie) plainDesc += ' — ' + body.categorie;
  if (body.ville) plainDesc += ' — ' + body.ville;

  await env.DB.prepare(
    `INSERT INTO publications (id, titre, page_name, activity_name, description, date, lien, certifie, whatsapp, prix, lieu, image, auteur_id, type, promoteur, texte_publication, accessibilite, payment_phone) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    id,
    body.promoteur || body.titre || 'Modification #' + id,
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
    'modification',
    body.promoteur || '',
    body.texte_publication || '',
    Array.isArray(body.access) ? body.access.join(',') : (body.access || ''),
    body.payment_phone || ''
  ).run();

  return success({ modification: { id, original_id: originalId } });
}
