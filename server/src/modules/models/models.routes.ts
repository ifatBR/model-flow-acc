import { FastifyInstance } from 'fastify';
import { getVersionElements, saveVersionElements } from './models.services';

export async function modelsRoutes(app: FastifyInstance) {
  app.get<{ Params: { itemId: string; versionNum: string } }>(
    '/:itemId/versions/:versionNum/elements',
    async (req) => {
      const { itemId, versionNum } = req.params;
      return getVersionElements(decodeURIComponent(itemId), parseInt(versionNum, 10));
    },
  );

  app.post<{ Params: { itemId: string; versionNum: string }; Body: unknown[] }>(
    '/:itemId/versions/:versionNum/elements',
    async (req, reply) => {
      const { itemId, versionNum } = req.params;
      await saveVersionElements(decodeURIComponent(itemId), parseInt(versionNum, 10), req.body);
      return reply.code(204).send();
    },
  );
}
