import { FastifyInstance } from 'fastify';
import { getBucketFolderContents, getBucketItemVersions } from '../hubs/hubs.services';

export async function bucketProjectRoutes(app: FastifyInstance) {
  app.get<{ Params: { projectId: string; folderId: string } }>(
    '/:projectId/folders/:folderId/contents',
    async (req) => {
      const { projectId, folderId } = req.params;
      return getBucketFolderContents(projectId, folderId);
    },
  );

  app.get<{ Params: { projectId: string; itemId: string } }>(
    '/:projectId/items/:itemId/versions',
    async (req) => {
      const { projectId, itemId } = req.params;
      return getBucketItemVersions(projectId, itemId);
    },
  );
}
