// Transaction model helpers for D1
export async function listTransactions(db) {
  return await db.prepare('SELECT * FROM transactions').all();
}

export async function createTransaction(db, { user_id, amount, type, description }) {
  return await db.prepare('INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)').bind(user_id, amount, type, description).run();
}
