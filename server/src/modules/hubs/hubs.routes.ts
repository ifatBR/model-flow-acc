import { FastifyInstance } from 'fastify';
import { getHubById, getHubs, getProjectFolders } from './hubs.services';

export async function hubRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    return getHubs();
  });

  app.get<{ Params: { id: string } }>('/:id/projects', async (req) => {
    const { id } = req.params;
    return getHubById(id);
  });

  app.get<{ Params: { hubId: string; projectId: string } }>(
    '/:hubId/projects/:projectId/topFolders',
    async (req) => {
      const { hubId, projectId } = req.params;
      return getProjectFolders(hubId, projectId);
    },
  );
}
