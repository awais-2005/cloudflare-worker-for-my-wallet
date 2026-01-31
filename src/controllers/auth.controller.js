import { json } from 'hono';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signJwt } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

export async function register(c) {
  const { name, email, password } = await c.req.json();
  const db = c.env.DB;
  const hashed = await hashPassword(password);
  try {
    await db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').bind(name, email, hashed).run();
    return c.json({ message: 'User registered' }, 201);
  } catch (e) {
    throw new ApiError(400, 'Registration failed');
  }
}

export async function login(c) {
  const { email, password } = await c.req.json();
  const db = c.env.DB;
  const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user || !(await comparePassword(password, user.password))) {
    throw new ApiError(401, 'Invalid credentials');
  }
  const token = await signJwt({ id: user.id, email: user.email });
  return c.json({ token });
}
