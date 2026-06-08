import { FastifyInstance } from 'fastify';
import {
  getVersionElements,
  saveVersionElements,
  saveVersionElementsChunks,
  saveComparisonReport,
  getAllComparisonReports,
} from './models.services';

export async function modelsRoutes(app: FastifyInstance) {
  app.get<{ Params: { itemId: string; versionNum: string } }>(
    '/:itemId/versions/:versionNum/elements',
    async (req) => {
      const { itemId, versionNum } = req.params;
      return getVersionElements(decodeURIComponent(itemId), parseInt(versionNum, 10));
    },
  );

  app.post<{
    Params: { itemId: string; versionNum: string };
    Body: { chunkIndex: number; isLastChunk: boolean; elements: unknown[] };
  }>('/:itemId/versions/:versionNum/elements/chunks', async (req, reply) => {
    const { itemId, versionNum } = req.params;
    await saveVersionElementsChunks(decodeURIComponent(itemId), parseInt(versionNum, 10), req.body);
    return reply.code(204).send();
  });

  app.post<{ Params: { itemId: string; versionNum: string }; Body: unknown[] }>(
    '/:itemId/versions/:versionNum/elements',
    async (req, reply) => {
      const { itemId, versionNum } = req.params;
      await saveVersionElements(decodeURIComponent(itemId), parseInt(versionNum, 10), req.body);
      return reply.code(204).send();
    },
  );

  app.post<{
    Params: { itemId: string; earlierVersion: string; laterVersion: string };
    Body: { modelName: string; data: { id: string; diff: string }[] };
  }>('/:itemId/comparisons/:earlierVersion/:laterVersion/report', async (req, reply) => {
    const { itemId, earlierVersion, laterVersion } = req.params;
    await saveComparisonReport(
      decodeURIComponent(itemId),
      parseInt(earlierVersion, 10),
      parseInt(laterVersion, 10),
      req.body.modelName,
      req.body.data,
    );
    return reply.code(204).send();
  });

  app.get('/comparisons', async () => {
    return getAllComparisonReports();
  });
}
