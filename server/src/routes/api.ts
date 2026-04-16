import { FastifyInstance } from 'fastify';
import { apsRoutes } from '@modules/aps/aps.routes';

async function apiRoutes(fastify: FastifyInstance) {
  fastify.register(apsRoutes, { prefix: '/aps' });
}

export default apiRoutes;
