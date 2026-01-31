import { Hono } from 'hono';
import { handleAuthRoutes } from './routes/auth.js';
import { handleUserRoutes } from './routes/user.js';
import { handleHealthRoutes } from './routes/health.js';
import { handleTransactionRoutes } from './routes/transaction.js';
import { errorHandler } from './middleware/error.js';
import { notFoundHandler } from './middleware/notFound.js';
import { requestLogger } from './middleware/requestLogger.js';

const app = new Hono();

app.use('*', requestLogger);

handleAuthRoutes(app);
handleUserRoutes(app);
handleHealthRoutes(app);
handleTransactionRoutes(app);

app.notFound(notFoundHandler);
app.onError(errorHandler);

export default app;
