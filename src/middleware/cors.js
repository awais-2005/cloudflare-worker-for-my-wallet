// CORS middleware for Hono
export const cors = (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-api-key');
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }
  return next();
};
