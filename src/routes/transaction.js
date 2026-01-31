import { Hono } from 'hono';
import { listTransactions, createTransaction } from '../controllers/transaction.controller.js';
import { authGuard } from '../middleware/authGuard.js';

export function handleTransactionRoutes(app) {
  app.get('/transactions', authGuard, listTransactions);
  app.post('/transactions', authGuard, createTransaction);
}
