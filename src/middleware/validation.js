import { ApiError } from '../utils/ApiError.js';

export async function validateRegister(c, next) {
  const { name, email, password } = await c.req.json();
  if (!name || !email || !password) throw new ApiError(400, 'Missing fields');
  await next();
}

export async function validateLogin(c, next) {
  const { email, password } = await c.req.json();
  if (!email || !password) throw new ApiError(400, 'Missing fields');
  await next();
}
