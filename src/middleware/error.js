export async function errorHandler(err, c) {
  const status = err.status || 500;
  return c.json({ error: err.message || 'Internal Server Error' }, status);
}
