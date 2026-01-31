// JWT sign/verify using Web Crypto API
const encoder = new TextEncoder();
const secret = (env) => encoder.encode(env.JWT_SECRET);

export async function signJwt(payload, env) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const base64 = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const toSign = `${base64(header)}.${base64(payload)}`;
  const key = await crypto.subtle.importKey('raw', secret(env), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(toSign));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${toSign}.${signature}`;
}

export async function verifyJwt(token, env) {
  const [headerB64, payloadB64, sigB64] = token.split('.');
  const toSign = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey('raw', secret(env), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const sig = Uint8Array.from(atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', key, sig, encoder.encode(toSign));
  if (!valid) throw new Error('Invalid token');
  return JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
}
