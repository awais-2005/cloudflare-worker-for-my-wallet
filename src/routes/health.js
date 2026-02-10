import { healthCheck } from '../controllers/health.controller.js';

export function handleHealthRoutes(app) {
  app.get('/health', healthCheck);
}
