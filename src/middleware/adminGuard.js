import { ApiError } from '../utils/ApiError.js';
import { verifyJwt } from '../utils/jwt.js';

export async function adminGuard(c, next) {
  const auth = c.req.header('authorization');
  if (!auth || !auth.startsWith('Bearer ')) throw new ApiError(401, 'No admin token');
  const token = auth.split(' ')[1];

  let payload;
  try {
    payload = await verifyJwt(token, c.env);
  } catch (e) {
    throw new ApiError(401, 'Invalid admin token');
  }

  if (payload.role !== 'admin') throw new ApiError(403, 'Not an admin');

  c.set('admin', payload);
  await next();
}
