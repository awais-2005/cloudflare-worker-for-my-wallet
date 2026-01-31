import { ApiError } from '../utils/ApiError.js';
import { verifyJwt } from '../utils/jwt.js';

export async function authGuard(c, next) {
  console.log('authGuard middleware hit');
  const auth = c.req.header('authorization');
  if (!auth || !auth.startsWith('Bearer ')) throw new ApiError(401, 'No token');
  const token = auth.split(" ")[1];
  try {
    const user = await verifyJwt(token, c.env);
    console.log('user from JWT:', user);
    c.set('user', user);
    await next();
  } catch (e) {
    console.log('JWT verification failed:', e);
    throw new ApiError(401, 'Invalid token');
  }
}
