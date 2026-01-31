// Use Web Crypto API for password hashing (PBKDF2 or subtle.digest)
export async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function comparePassword(password, hash) {
  return (await hashPassword(password)) === hash;
}
