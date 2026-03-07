export async function getAdminCount(db) {
  const row = await db.prepare('SELECT COUNT(*) as count FROM admins').first();
  return row.count;
}

export async function findAdminByUsername(db, username) {
  return await db.prepare('SELECT * FROM admins WHERE username = ?').bind(username).first();
}

export async function createAdmin(db, { username, password }) {
  return await db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').bind(username, password).run();
}

export async function getAllUsers(db) {
  return await db.prepare('SELECT id, name, email, currency, avatar, created_at FROM users').all();
}

export async function getUserWithTransactions(db, userId) {
  const user = await db.prepare('SELECT id, name, email, currency, avatar FROM users WHERE id = ?').bind(userId).first();
  if (!user) return null;
  const transactions = await db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all();
  return { ...user, transactions: transactions.results };
}

export async function getAllTransactions(db) {
  return await db.prepare(`
    SELECT t.*, u.name as user_name, u.email as user_email
    FROM transactions t
    LEFT JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
  `).all();
}

export async function getDashboardStats(db) {
  const userCount = await db.prepare('SELECT COUNT(*) as count FROM users').first();
  const txCount = await db.prepare('SELECT COUNT(*) as count FROM transactions').first();
  const totalIncome = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income'").first();
  const totalExpense = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'").first();
  return {
    totalUsers: userCount.count,
    totalTransactions: txCount.count,
    totalIncome: totalIncome.total,
    totalExpense: totalExpense.total,
  };
}
