export async function healthCheck(c) {
  return c.json({ status: 'ok' });
}
