import { FastifyInstance } from 'fastify';

import { getFolderContent } from './projects.services';

export async function projectRoutes(app: FastifyInstance) {
  app.get<{ Params: { projectId: string; folderId: string } }>(
    '/:projectId/folders/:folderId/contents',
    async (req) => {
      const { accessToken } = req.headers;
      const { projectId, folderId } = req.params;
      return getFolderContent(projectId, folderId, accessToken);
    },
  );
}
