import { FastifyInstance } from 'fastify';
import { getAccessToken } from '../services/aps.service';

export async function apsRoutes(app: FastifyInstance) {
  app.get('/token', async () => {
    return getAccessToken();
  });
}
