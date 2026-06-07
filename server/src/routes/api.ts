import { FastifyInstance } from 'fastify';
import { apsRoutes } from '@modules/aps/aps.routes';
import { deriviativeRoutes } from '@modules/deriviative/deriviative.routes';
import { hubRoutes } from '@modules/hubs/hubs.routes';
import { projectRoutes } from '@modules/projects/projects.routes';
import { authRoutes } from '@modules/auth/auth.routes';
import { modelsRoutes } from '@modules/models/models.routes';
import { bucketApsRoutes } from '@modules_bucket_based/bucket/bucket.routes';
import { bucketHubRoutes } from '@modules_bucket_based/hubs/hubs.routes';
import { bucketProjectRoutes } from '@modules_bucket_based/projects/projects.routes';

const useBuckets = process.env.DATA_SOURCE === 'bucket';

async function apiRoutes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(deriviativeRoutes, { prefix: '/deriviative' });
  fastify.register(modelsRoutes, { prefix: '/models' });

  if (useBuckets) {
    fastify.register(bucketApsRoutes, { prefix: '/aps' });
    fastify.register(bucketHubRoutes, { prefix: '/hubs' });
    fastify.register(bucketProjectRoutes, { prefix: '/projects' });
  } else {
    fastify.register(apsRoutes, { prefix: '/aps' });
    fastify.register(hubRoutes, { prefix: '/hubs' });
    fastify.register(projectRoutes, { prefix: '/projects' });
  }
}

export default apiRoutes;
