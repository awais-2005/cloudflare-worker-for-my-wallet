import { listTransactions, createTransaction, updateTransaction, deleteTxById, saveTransaction } from '../controllers/transaction.controller.js';
import { authGuard } from '../middleware/authGuard.js';

export function handleTransactionRoutes(app) {
  app.get('/transactions', authGuard, listTransactions);
  app.post('/transaction/new', authGuard, createTransaction);
  app.post('/transaction/save', authGuard, saveTransaction);
  app.put('/transaction/update/:id', authGuard, updateTransaction);
  app.delete('/transaction/delete/:id', authGuard, deleteTxById);
}
