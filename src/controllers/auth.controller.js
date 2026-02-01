import { hashPassword, comparePassword } from '../utils/hash.js';
import { signJwt } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { otpGenerator } from '../utils/otpGenerator.js';

export async function register(c) {
  const { name, email, password } = await c.req.json();
  const db = c.env.DB;
  const hashed = await hashPassword(password);
  try {
    await db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').bind(name, email, hashed).run();
    return c.json({ message: 'User registered' }, 201);
  } catch (e) {
    console.log("ERR: ", e)
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
  const token = await signJwt({ id: user.id, email: user.email }, c.env);
  return c.json({ token });
}

export async function sendOTP(c) {
  
  const user = c.get('user');
  const OTP_CODE = otpGenerator(6);
  console.log("Email: ", user.email);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${c.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Acme <onboarding@resend.dev>",
        to: user.email,
        subject: `Your OTP is ${OTP_CODE}`,
        html: `<p>Your OTP is <strong>${OTP_CODE}</strong>. Do not share is with anyone.</p>`
      }),
    });

    if (response.ok) {
      return c.json({ OTP: OTP_CODE });
    }

    const details = await response.json();
    return c.json(details);

  } catch (err) {
    console.log(err);
    throw new ApiError(500, `Could not send email to ${user.email}`);
  }
}