import { setUserAvatar } from '../models/user.js';
import { ApiError } from '../utils/ApiError.js';
import { hashPassword } from '../utils/hash.js';
import { signJwt } from '../utils/jwt.js';

// Set avatar for current user (by token)
export async function setAvatar(c) {
  const db = c.env.DB;
  const user = c.get('user');
  if (!user || !user.id) throw new ApiError(401, 'Unauthorized');
  let avatar;
  try {
    const body = await c.req.json();
    avatar = body.avatar;
  } catch {
    throw new ApiError(400, 'Invalid JSON body');
  }
  if (!avatar) throw new ApiError(400, 'Avatar URL is required');
  const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
  if (!userId || isNaN(userId)) throw new ApiError(400, 'Invalid user id');
  await setUserAvatar(db, userId, avatar);
  // Return updated user object
  const updated = await db.prepare('SELECT id, name, email, avatar FROM users WHERE id = ?').bind(userId).first();
  updated.avatar = updated.avatar || '';
  if (!updated.avatar) throw new ApiError(500, "Could not save avatar.");
  return c.json({ message: "Avatar updated." });
}


export async function getUser(c) {
  const db = c.env.DB;
  const id = c.req.param('id');
  const user = await db.prepare('SELECT id, name, email, avatar FROM users WHERE id = ?').bind(id).first();
  if (!user) throw new ApiError(404, 'User not found');
  user.avatar = user.avatar || '';
  return c.json(user);
}

export async function getUserInfo(c) {
  const db = c.env.DB;
  const user = c.get('user');
  if (!user || !user.id) throw new ApiError(401, 'Unauthorized');
  const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
  if (!userId || isNaN(userId)) throw new ApiError(400, 'Invalid user id');
  const userDetails = await db.prepare('SELECT id, name, email, avatar FROM users WHERE id = ?').bind(userId).first();
  if (!userDetails) throw new ApiError(404, 'User not found');
  userDetails.avatar = userDetails.avatar || '';
  return c.json(userDetails);
}

export async function deleteById(c) {
  const db = c.env.DB;
  let userId = c.req.param('id');
  if(!userId) throw new ApiError(404, "User id is missing from url");
  userId = typeof userId === "string" ? parseInt(userId, 10) : userId;
  try {
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
    if(!user) throw new Error("User not found");
    await db.prepare('DELETE FROM transactions WHERE user_id = ?').bind(userId).run();
    await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
    return c.json({statusCode: 200, message: `user with id: ${userId} has been deleted.`}, user);
  } catch (e) {
    throw new ApiError(400, e);
  }
}

export async function updateUser(c) {
  const db = c.env.DB;
  const user = c.get('user');
  const { name, email, password } = await c.req.json();
  if([name, email].some((field) => !field)) throw new ApiError(400, "Some field is missing in payload.")
  try {
    if(password) {
      const hash = await hashPassword(password);
      await db.prepare('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?').bind(name, email, hash, user.id).run();
    } else {
      await db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').bind(name, email, user.id).run();
    }
  } catch (err) {
    console.log("Err: ", err);
    throw new ApiError(400, "invalid data");
  }
  if(email !== user.email) {
    const token = await signJwt({ id: user.id, email }, c.env);
    return c.json({ message: 'User updated', token });
  }
  return c.json({ message: 'User updated'});
}

export async function listUsers(c) {
  const db = c.env.DB;
  const users = await db.prepare('SELECT id, name, email, avatar FROM users').all();
  const results = users.results.map(u => ({ ...u, avatar: u.avatar || '' }));
  return c.json(results);
}
