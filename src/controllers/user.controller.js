import { setUserAvatar } from '../models/user.js';
import { ApiError } from '../utils/ApiError.js';
import { json } from 'hono';

// Set avatar for user
export async function setAvatar(c) {
  const db = c.env.DB;
  const id = c.req.param('id');
  const { avatar } = await c.req.json();
  if (!avatar) throw new ApiError(400, 'Avatar URL is required');
  await setUserAvatar(db, id, avatar);
  return c.json({ message: 'Avatar updated' });
}

export async function getUser(c) {
  const db = c.env.DB;
  const id = c.req.param('id');
  const user = await db.prepare('SELECT id, name, email FROM users WHERE id = ?').bind(id).first();
  if (!user) throw new ApiError(404, 'User not found');
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
  const users = await db.prepare('SELECT id, name, email FROM users').all();
  return c.json(users.results);
}
