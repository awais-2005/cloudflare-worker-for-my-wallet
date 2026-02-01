import { ApiError } from '../utils/ApiError.js';
import { verifyJwt } from '../utils/jwt.js';
import { verifyPayloadWithDb } from '../utils/verifyPayload.js';

export async function authGuard(c, next) {

  const auth = c.req.header('authorization');
  if (!auth || !auth.startsWith('Bearer ')) throw new ApiError(401, 'No token');
  const token = auth.split(" ")[1];

  let user;
  try {
    user = await verifyJwt(token, c.env);
  } catch (e) {
    console.log('JWT verification failed:', e);
    throw new ApiError(401, 'Invalid token');
  }

  const isCorrect = await verifyPayloadWithDb(user, c.env.DB);
  if(!isCorrect) {
    throw new ApiError(401, "Token contains stale or invalid payload");
  }

  c.set('user', user);
  await next();
}
