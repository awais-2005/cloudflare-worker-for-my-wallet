import { Hono } from 'hono';
import { register, login, sendOTP } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { authGuard } from '../middleware/authGuard.js';

export function handleAuthRoutes(app) {
  app.post('/auth/register', validateRegister, register);
  app.post('/auth/login', validateLogin, login);
  app.post('/auth/otp', authGuard, sendOTP);
}
