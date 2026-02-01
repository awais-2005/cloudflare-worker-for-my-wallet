import { ApiError } from './ApiError.js';

// Usage: await verifyPayloadWithDb(userPayload, db)
// Returns true if user exists and info matches, false otherwise
export async function verifyPayloadWithDb(payload, db) {
  if (!payload || !payload.id || !payload.email) return false;
  try {
    const user = await db.prepare('SELECT id, email FROM users WHERE id = ?').bind(payload.id).first();
    if (!user) return false;
    // Compare id and email
    return user.id === payload.id && user.email === payload.email;
  } catch (e) {
    console.log('verifyPayloadWithDb error:', e);
    return false;
  }
}
