import { json, error, success, requireUser } from '../_utils.js';

// Admin: liste toutes les publications + actions (delete, certifie)
export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);

  const user = await requireUser(request, env);
  if (!user) return error('Non authentifié', 401);

  if (request.method === 'GET') {
    const all = await env.DB.prepare(
      `SELECT p.*, u.email AS auteur_email FROM publications p LEFT JOIN users u ON p.auteur_id = u.id ORDER BY p.created_at DESC`
    ).all();
    const publications = (all.results || []).map(function(p) {
      return {
        ...p,
        certifie: !!p.certifie,
        hero: !!p.hero,
        status: p.certifie ? 'certifie' : 'en_attente',
        tags: (function(t) { try { return JSON.parse(t); } catch(e) { return []; } })(p.tags)
      };
    });
    return success({ publications });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    if (body.action === 'delete' && Array.isArray(body.ids)) {
      for (const id of body.ids) {
        await env.DB.prepare('DELETE FROM publications WHERE id = ?').bind(String(id)).run();
      }
      return success({ deleted: body.ids });
    }
    if (body.action === 'certifie' && Array.isArray(body.ids)) {
      for (const id of body.ids) {
        await env.DB.prepare('UPDATE publications SET certifie = 1 WHERE id = ?').bind(String(id)).run();
      }
      return success({ certified: body.ids });
    }
    if (body.action === 'payment_validated' && Array.isArray(body.ids)) {
      for (const id of body.ids) {
        await env.DB.prepare('UPDATE publications SET payment_status = ? WHERE id = ?').bind('validated', String(id)).run();
      }
      return success({ updated: body.ids });
    }
    if (body.action === 'content_validated' && Array.isArray(body.ids)) {
      for (const id of body.ids) {
        await env.DB.prepare('UPDATE publications SET content_status = ? WHERE id = ?').bind('validated', String(id)).run();
      }
      return success({ updated: body.ids });
    }
    if (body.action === 'payment_rejected' && Array.isArray(body.ids)) {
      for (const id of body.ids) {
        await env.DB.prepare('UPDATE publications SET payment_status = ? WHERE id = ?').bind('rejected', String(id)).run();
      }
      return success({ updated: body.ids });
    }
    if (body.action === 'content_rejected' && Array.isArray(body.ids)) {
      for (const id of body.ids) {
        await env.DB.prepare('UPDATE publications SET content_status = ? WHERE id = ?').bind('rejected', String(id)).run();
      }
      return success({ updated: body.ids });
    }
    if (body.action === 'publish' && Array.isArray(body.ids)) {
      for (const id of body.ids) {
        await env.DB.prepare('UPDATE publications SET certifie = 1, payment_status = ?, content_status = ? WHERE id = ?').bind('validated', 'validated', String(id)).run();
      }
      return success({ published: body.ids });
    }
    return error('Action non reconnue', 400);
  }

  return error('Méthode non autorisée', 405);
}
