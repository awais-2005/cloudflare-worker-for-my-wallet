export async function requestLogger(c, next) {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
}
