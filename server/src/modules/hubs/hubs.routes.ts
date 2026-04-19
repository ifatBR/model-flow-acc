import { FastifyInstance } from 'fastify';
import { getHubById, getHubs, getProjectFolders } from './hubs.services';

export async function hubRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const { accessToken } = req.headers;
    return getHubs(accessToken);
  });

  app.get<{ Params: { id: string } }>('/:id/projects', async (req) => {
    const { accessToken } = req.headers;
    const { id } = req.params;
    return getHubById(id, accessToken);
  });

  app.get<{ Params: { hubId: string; projectId: string } }>(
    '/:hubId/projects/:projectId/topFolders',
    async (req) => {
      const { accessToken } = req.headers;
      const { hubId, projectId } = req.params;
      return getProjectFolders(hubId, projectId, accessToken);
    },
  );
}
