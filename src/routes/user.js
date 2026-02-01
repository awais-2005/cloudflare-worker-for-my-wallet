import { getUser, getUserInfo, updateUser, listUsers, setAvatar } from '../controllers/user.controller.js';
import { authGuard } from '../middleware/authGuard.js';

export function handleUserRoutes(app) {
  app.put('/user/avatar', authGuard, setAvatar);
  app.get('/users', authGuard, listUsers);
  app.get('/user/:id', authGuard, getUser);
  app.get('/user/info', authGuard, getUserInfo);
  app.put('/user/update', authGuard, updateUser);
}
