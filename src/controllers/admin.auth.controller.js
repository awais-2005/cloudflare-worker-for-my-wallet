import { hashPassword, comparePassword } from '../utils/hash.js';
import { signJwt } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { getAdminCount, findAdminByUsername, createAdmin } from '../models/admin.js';

export async function adminSignup(c) {
  const db = c.env.DB;
  const count = await getAdminCount(db);
  if (count > 0) throw new ApiError(403, 'Admin already exists. Only one admin is allowed.');

  const { username, password } = await c.req.json();
  if (!username || !password) throw new ApiError(400, 'Username and password are required');

  const hashed = await hashPassword(password);
  await createAdmin(db, { username, password: hashed });

  return c.json({ message: 'Admin created successfully' }, 201);
}

export async function adminLogin(c) {
  const db = c.env.DB;
  const { username, password } = await c.req.json();
  if (!username || !password) throw new ApiError(400, 'Username and password are required');

  const admin = await findAdminByUsername(db, username);
  if (!admin || !(await comparePassword(password, admin.password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = await signJwt({ id: admin.id, username: admin.username, role: 'admin' }, c.env);
  return c.json({ token });
}

export async function adminCanSignup(c) {
  const db = c.env.DB;
  const count = await getAdminCount(db);
  return c.json({ canSignup: count === 0 });
}
