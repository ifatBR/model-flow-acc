import { FastifyInstance } from 'fastify';
import { apsRoutes } from '@modules/aps/aps.routes';
import { deriviativeRoutes } from '@modules/deriviative/deriviative.routes';
import { hubRoutes } from '@modules/hubs/hubs.routes';
import { projectRoutes } from '@modules/projects/projects.routes';
import { authRoutes } from '@modules/auth/auth.routes';

async function apiRoutes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(apsRoutes, { prefix: '/aps' });
  fastify.register(deriviativeRoutes, { prefix: '/deriviative' });
  fastify.register(hubRoutes, { prefix: '/hubs' });
  fastify.register(projectRoutes, { prefix: '/projects' });
}

export default apiRoutes;
