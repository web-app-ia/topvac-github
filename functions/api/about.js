import { json, error, success } from './_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'GET') return error('Méthode non autorisée', 405);

  const about = await env.DB.prepare('SELECT data FROM about_data WHERE id = 1').first();
  let data = { site: { name: 'TOP VACANCES.BF' }, about: { mission: 'Plateforme de collecte d\'informations intelligente' }, pricing: { free_plan: {}, premium_plan: {} }, contact: {} };
  if (about) { try { data = { ...data, ...JSON.parse(about.data) }; } catch(e) {} }
  return success(data);
}
