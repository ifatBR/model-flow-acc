import { FastifyInstance } from 'fastify';
import { listObjects, uploadFile, deleteObject, createNewFolder } from './bucket.services';

export async function bucketApsRoutes(app: FastifyInstance) {
  app.get('/objects', async () => listObjects());

  app.post('/upload', async (req, reply) => {
    const file = await req.file({ limits: { fileSize: 100 * 1024 * 1024 } });
    if (!file) return reply.code(400).send({ error: 'No file uploaded' });
    const fileBuffer = await file.toBuffer();
    return uploadFile(fileBuffer, file.filename);
  });

  app.delete<{ Params: { key: string } }>('/objects/:key', async (req) => {
    return deleteObject(req.params.key);
  });

  app.post<{ Body: { folderName: string } }>('/folders', async (req, reply) => {
    const { folderName } = req.body;
    if (!folderName) return reply.code(400).send({ error: 'Missing folderName' });
    return createNewFolder(folderName);
  });
}
