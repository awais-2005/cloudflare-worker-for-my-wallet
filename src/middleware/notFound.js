export async function notFoundHandler(c) {
  return c.json({ error: 'Not Found' }, 404);
}
