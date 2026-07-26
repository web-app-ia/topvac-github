import { json, error, success, requireUser } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);

  const user = await requireUser(request, env);
  if (!user) return error('Non authentifie', 401);

  if (request.method === 'GET') {
    const all = await env.DB.prepare(
      'SELECT p.*, u.email AS auteur_email FROM publications p LEFT JOIN users u ON p.auteur_id = u.id WHERE p.type = ? ORDER BY p.created_at DESC'
    ).bind('modification').all();

    const modifications = (all.results || []).map(function(p) {
      var desc = {};
      try { desc = JSON.parse(p.description || '{}'); } catch(e) {}
      var meta = desc.meta || {};
      return {
        ...p,
        modification_of: meta.modification_of || '',
        modification_status: meta.modification_status || 'pending',
        certifie: !!p.certifie,
        hero: !!p.hero,
        _meta: meta
      };
    }).filter(function(m) { return m.modification_status === 'pending'; });

    return success({ modifications });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const modId = body.id;
    if (!modId) return error('id requis', 400);

    const mod = await env.DB.prepare('SELECT * FROM publications WHERE id = ?').bind(modId).first();
    if (!mod) return error('Modification introuvable', 404);

    var desc = {};
    try { desc = JSON.parse(mod.description || '{}'); } catch(e) {}
    var meta = desc.meta || {};
    var originalId = meta.modification_of;
    if (!originalId) return error('Publication originale non referencee', 400);

    if (body.action === 'validate') {
      var sets = [];
      var vals = [];
      var fields = ['titre','page_name','activity_name','whatsapp','prix','lieu','image','promoteur','texte_publication','accessibilite'];
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        if (mod[f] !== undefined) {
          sets.push(f + '=?');
          vals.push(mod[f]);
        }
      }

      var origPub = await env.DB.prepare('SELECT description FROM publications WHERE id = ?').bind(originalId).first();
      var origDesc = {};
      try { origDesc = JSON.parse(origPub.description || '{}'); } catch(e) {}
      origDesc.meta = meta;
      delete origDesc.meta.modification_of;
      delete origDesc.meta.modification_status;
      origDesc.text = desc.text || origDesc.text;
      origDesc.promoteur = desc.promoteur || origDesc.promoteur;
      origDesc.texte_publication = desc.texte_publication || origDesc.texte_publication;

      sets.push('description=?');
      vals.push(JSON.stringify(origDesc));
      sets.push("updated_at=datetime('now')");

      await env.DB.prepare('UPDATE publications SET ' + sets.join(',') + ' WHERE id=?').bind(...vals, originalId).run();

      meta.modification_status = 'validated';
      desc.meta = meta;
      await env.DB.prepare('UPDATE publications SET description=?, updated_at=datetime(\'now\') WHERE id=?').bind(JSON.stringify(desc), modId).run();

      return success({ message: 'Modification validee et appliquee', original_id: originalId });
    }

    if (body.action === 'reject') {
      meta.modification_status = 'rejected';
      desc.meta = meta;
      await env.DB.prepare('UPDATE publications SET description=?, updated_at=datetime(\'now\') WHERE id=?').bind(JSON.stringify(desc), modId).run();
      return success({ message: 'Modification rejetee' });
    }

    if (body.action === 'extract') {
      return success({
        modification_id: modId,
        original_id: originalId,
        data: {
          id: mod.id,
          original_id: originalId,
          titre: mod.titre,
          page_name: mod.page_name,
          activity_name: mod.activity_name,
          description: desc,
          promoteur: mod.promoteur,
          texte_publication: mod.texte_publication,
          whatsapp: mod.whatsapp,
          image: mod.image,
          prix: mod.prix,
          lieu: mod.lieu
        }
      });
    }

    return error('Action non reconnue', 400);
  }

  return error('Methode non autorisee', 405);
}
