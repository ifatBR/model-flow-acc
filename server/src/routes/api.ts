import { FastifyInstance } from 'fastify';
import { apsRoutes } from '@modules/aps/aps.routes';
import { deriviativeRoutes } from '@modules/deriviative/deriviative.routes';

async function apiRoutes(fastify: FastifyInstance) {
  fastify.register(apsRoutes, { prefix: '/aps' });
  fastify.register(deriviativeRoutes, { prefix: '/deriviative' });
}

export default apiRoutes;
