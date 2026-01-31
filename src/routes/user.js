import { getUser, updateUser, listUsers, setAvatar } from '../controllers/user.controller.js';
import { authGuard } from '../middleware/authGuard.js';

export function handleUserRoutes(app) {
  app.put('/users/avatar', authGuard, setAvatar);
  app.get('/users', authGuard, listUsers);
  app.get('/users/:id', authGuard, getUser);
  app.put('/users/:id', authGuard, updateUser);
}
