import { Hono } from 'hono';
import { register, login } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

export function handleAuthRoutes(app) {
  app.post('/auth/register', validateRegister, register);
  app.post('/auth/login', validateLogin, login);
}
