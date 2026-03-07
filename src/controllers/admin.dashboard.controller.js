import { ApiError } from '../utils/ApiError.js';
import { getDashboardStats, getAllUsers, getUserWithTransactions, getAllTransactions } from '../models/admin.js';

export async function getStats(c) {
  const db = c.env.DB;
  const stats = await getDashboardStats(db);
  return c.json(stats);
}

export async function getUsers(c) {
  const db = c.env.DB;
  const result = await getAllUsers(db);
  return c.json(result.results);
}

export async function getUserDetails(c) {
  const db = c.env.DB;
  const id = c.req.param('id');
  const data = await getUserWithTransactions(db, id);
  if (!data) throw new ApiError(404, 'User not found');
  return c.json(data);
}

export async function getTransactions(c) {
  const db = c.env.DB;
  const result = await getAllTransactions(db);
  return c.json(result.results);
}
