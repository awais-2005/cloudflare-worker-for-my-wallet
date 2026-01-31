import { ApiError } from '../utils/ApiError.js';
import { verifyJwt } from '../utils/jwt.js';

export async function authGuard(c, next) {
  const auth = c.req.header('authorization');
  if (!auth || !auth.startsWith('Bearer ')) throw new ApiError(401, 'No token');
  const token = auth.slice(7);
  try {
    c.set('user', await verifyJwt(token));
    await next();
  } catch {
    throw new ApiError(401, 'Invalid token');
  }
}
