import { FastifyInstance } from 'fastify';
import { getVersionElements } from './models.services';

export async function modelsRoutes(app: FastifyInstance) {
  app.get<{ Params: { itemId: string; versionNum: string } }>(
    '/:itemId/versions/:versionNum/elements',
    async (req) => {
      const { itemId, versionNum } = req.params;
      return getVersionElements(decodeURIComponent(itemId), parseInt(versionNum, 10));
    },
  );
}
