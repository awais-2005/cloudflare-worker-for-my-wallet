import { ApiError } from '../utils/ApiError.js';

export async function listTransactions(c) {
  const db = c.env.DB;
  const transactions = await db.prepare('SELECT * FROM transactions').all();
  return c.json(transactions.results);
}

export async function createTransaction(c) {
  const db = c.env.DB;
  const { user_id, amount, type, description } = await c.req.json();
  if (!user_id || !amount || !type) throw new ApiError(400, 'Missing fields');
  await db.prepare('INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)').bind(user_id, amount, type, description).run();
  return c.json({ message: 'Transaction created' }, 201);
}
