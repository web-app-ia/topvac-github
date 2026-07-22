import { json, error, success } from '../_utils.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return json({}, 200);
  if (request.method !== 'POST') return error('Méthode non autorisée', 405);

  const body = await request.json();
  const { idToken } = body;
  if (!idToken) return error('Token manquant', 400);

  // Verify Firebase token via Firebase Identity Toolkit API
  let fbPayload;
  try {
    const resp = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyAfjOC8tauUBXsYv9-4uYXZL-EsiV2XUuA', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    fbPayload = await resp.json();
    if (fbPayload.error) throw new Error(fbPayload.error.message || 'invalid_token');
  } catch (e) {
    return error('Token invalide: ' + e.message, 401);
  }

  const userInfo = fbPayload.users && fbPayload.users[0];
  if (!userInfo) return error('Token invalide: aucun utilisateur', 401);

  const googleId = userInfo.localId;
  const email = userInfo.email || '';
  const name = userInfo.displayName || email.split('@')[0];
  const picture = userInfo.photoUrl || '';

  // Upsert user
  let user = await env.DB.prepare('SELECT * FROM users WHERE google_id = ?').bind(googleId).first();
  if (user) {
    await env.DB.prepare('UPDATE users SET email=?, name=?, picture=? WHERE id=?').bind(email, name, picture, user.id).run();
  } else {
    const uid = 'user_' + Date.now();
    await env.DB.prepare('INSERT INTO users (id, email, name, picture, google_id) VALUES (?,?,?,?,?)').bind(uid, email, name, picture, googleId).run();
    user = { id: uid, email, name, picture, google_id: googleId };
  }

  // Create session
  const sessionToken = 'sess_' + crypto.randomUUID();
  await env.DB.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?,?,?,datetime(\'now\', \'+30 days\'))').bind('sess_' + Date.now(), user.id, sessionToken).run();

  return success({
    sessionToken,
    user: { id: user.id, email: user.email, name: user.name, picture: user.picture }
  });
}
