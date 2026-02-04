export async function healthCheck(c) {
  console.log("Health checked!");
  return c.json({ status: 'ok' });
}
