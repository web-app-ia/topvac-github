// Shared helpers for API functions
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' }
  });
}

export function error(msg, status = 400) {
  return json({ success: false, error: msg }, status);
}

export function success(data) {
  return json({ success: true, ...data });
}

export async function getUserFromRequest(request, env) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const result = await env.DB.prepare('SELECT user_id FROM sessions WHERE token = ? AND (expires_at IS NULL OR expires_at > datetime(\'now\'))').bind(token).first();
  if (!result) return null;
  const user = await env.DB.prepare('SELECT id, email, name, picture FROM users WHERE id = ?').bind(result.user_id).first();
  return user || null;
}

export async function requireUser(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return null;
  return user;
}
