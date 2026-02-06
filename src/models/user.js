// User model helpers for D1
export async function findUserByEmail(db, email) {
  return await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
}

export async function createUser(db, { name, email, currency, password }) {
  return await db.prepare('INSERT INTO users (name, email, currency, password) VALUES (?, ?, ?, ?)').bind(name, email, currency, password).run();
}


export async function getUserById(db, id) {
  return await db.prepare('SELECT id, name, email, currency, avatar FROM users WHERE id = ?').bind(id).first();
}

export async function setUserAvatar(db, id, avatarUrl) {
  return await db.prepare('UPDATE users SET avatar = ? WHERE id = ?').bind(avatarUrl, id).run();
}
