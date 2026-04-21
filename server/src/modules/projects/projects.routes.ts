import { FastifyInstance } from 'fastify';

import { getFolderContent, getItemVersions } from './projects.services';

export async function projectRoutes(app: FastifyInstance) {
  app.get<{ Params: { projectId: string; folderId: string } }>(
    '/:projectId/folders/:folderId/contents',
    async (req) => {
      const { projectId, folderId } = req.params;
      return getFolderContent(projectId, folderId);
    },
  );

  app.get<{ Params: { projectId: string; itemId: string } }>(
    '/:projectId/items/:itemId/versions',
    async (req) => {
      const { projectId, itemId } = req.params;
      return getItemVersions(projectId, itemId);
    },
  );
}
