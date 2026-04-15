import { FastifyInstance } from 'fastify';
import {
  getAccessToken,
  createBucket,
  uploadFile,
  listObjects,
  translateObject,
  getManifest,
} from '../services/aps.service';

export async function apsRoutes(app: FastifyInstance) {
  app.get('/token', async () => {
    return getAccessToken();
  });

  app.post('/createBucket', async () => {
    return createBucket();
  });

  app.post('/upload', async (req, reply) => {
    const file = await req.file({
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    });

    if (!file) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }
    const buffer = await file.toBuffer();

    const fileBuffer = await file.toBuffer();
    return uploadFile(fileBuffer, file.filename);
  });

  app.get('/objects', async () => listObjects());

  app.post<{ Body: { objectId: string } }>('/translate', async (req) => {
    const { objectId } = req.body;
    return translateObject(objectId);
  });

  app.post<{ Body: { urn: string } }>('/manifest', async (req) => {
    const { urn } = req.body;
    return getManifest(urn);
  });
}
