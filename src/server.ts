import 'dotenv/config';
import Fastify from 'fastify';
import { apsRoutes } from './routes/aps.routes';

const app = Fastify({ logger: true, routerOptions: { ignoreTrailingSlash: true } });
app.get('/', async (request, reply) => {
  reply.send({ hello: 'world' });
});
app.register(apsRoutes, { prefix: '/api/aps' });
app.listen({ port: 3000 }, function (err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
