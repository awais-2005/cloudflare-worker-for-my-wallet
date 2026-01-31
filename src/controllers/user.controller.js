import { setUserAvatar } from '../models/user.js';
import { ApiError } from '../utils/ApiError.js';

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
  if(!updated.avatar) throw new ApiError(500, "Could not save avatar.");
  return c.json({message: "Avatar updated."});
}


export async function getUser(c) {
  const db = c.env.DB;
  const id = c.req.param('id');
  const user = await db.prepare('SELECT id, name, email, avatar FROM users WHERE id = ?').bind(id).first();
  if (!user) throw new ApiError(404, 'User not found');
  user.avatar = user.avatar || '';
  return c.json(user);
}

export async function updateUser(c) {
  const db = c.env.DB;
  const id = c.req.param('id');
  const { name, email } = await c.req.json();
  await db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').bind(name, email, id).run();
  return c.json({ message: 'User updated' });
}

export async function listUsers(c) {
  const db = c.env.DB;
  const users = await db.prepare('SELECT id, name, email, avatar FROM users').all();
  const results = users.results.map(u => ({ ...u, avatar: u.avatar || '' }));
  return c.json(results);
}
