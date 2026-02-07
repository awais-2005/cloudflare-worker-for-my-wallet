import { getUser, getUserInfo, updateUser, listUsers, setAvatar, deleteById, updatePassword, updateCurrency } from '../controllers/user.controller.js';
import { authGuard } from '../middleware/authGuard.js';

export function handleUserRoutes(app) {
  app.get('/users', listUsers);
  app.get('/user/:id', getUser);
  app.get('/user/info', authGuard, getUserInfo);
  app.put('/user/update', authGuard, updateUser);
  app.put('/user/avatar', authGuard, setAvatar);
  app.put('/user/setpassword/:id', updatePassword);
  app.put('/user/setcurrency/:id', updateCurrency);
  app.delete('/user/delete/:id', deleteById);
}
