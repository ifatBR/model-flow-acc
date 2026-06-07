import { FastifyInstance } from 'fastify';
import { getBucketAsHubs, getBucketAsProjects, getBucketTopFolders } from './hubs.services';

export async function bucketHubRoutes(app: FastifyInstance) {
  app.get('/', async () => getBucketAsHubs());

  app.get<{ Params: { id: string } }>('/:id/projects', async (req) => {
    return getBucketAsProjects(req.params.id);
  });

  app.get<{ Params: { hubId: string; projectId: string } }>(
    '/:hubId/projects/:projectId/topFolders',
    async (req) => {
      const { hubId, projectId } = req.params;
      return getBucketTopFolders(hubId, projectId);
    },
  );
}
