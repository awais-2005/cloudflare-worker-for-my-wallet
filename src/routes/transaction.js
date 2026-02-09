import { Hono } from 'hono';
import { listTransactions, createTransaction, updateTransaction, deleteTxById } from '../controllers/transaction.controller.js';
import { authGuard } from '../middleware/authGuard.js';

export function handleTransactionRoutes(app) {
  app.get('/transactions', authGuard, listTransactions);
  app.post('/transaction/new', authGuard, createTransaction);
  app.put('/transaction/update/:id', authGuard, updateTransaction);
  app.delete('/transaction/delete/:id', authGuard, deleteTxById);
}
