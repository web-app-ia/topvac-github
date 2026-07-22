export function onRequest(context) {
  return new Response(JSON.stringify({
    status: 'ok',
    time: new Date().toISOString(),
    environment: 'production',
    maintenance: true,
    version: '1.0.0'
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
