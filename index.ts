/* eslint-disable import/first */
import { config } from 'dotenv';

config();
import fastify, { RouteOptions } from 'fastify';
import fs from 'fs';
import cors from '@fastify/cors';
import JWT, { JwtPayload } from 'jsonwebtoken';
import routes from './infra/routes';
import User from './domain/user';
import logger from './infra/logger';

const server = fastify({ logger, ignoreTrailingSlash: true });

server.register(cors, {});

routes.forEach((r) => server.route(r as RouteOptions));

server.addSchema(
  JSON.parse(fs.readFileSync('./schemas/widget.json').toString())
);
server.addSchema(
  JSON.parse(fs.readFileSync('./schemas/dashboard.json').toString())
);

server.decorateRequest('user', null);
server.addHook('preHandler', async (request, reply) => {
  if (request.routeConfig.requireAuth) {
    try {
      const tokenHeader = request.headers.authorization as string;
      const authToken = tokenHeader.slice('Bearer '.length);
      const parsed = JWT.decode(authToken) as JwtPayload;
      const { id, address, username } = parsed;

      const user = new User({ id, address, username });
      request.user = user;
    } catch (err) {
      request.log.error(err, 'Error parsing auth token');
      reply.status(401);
      reply.send();
    }
  }
});

// Run the server!
const start = async () => {
  try {
    await server.listen({ port: Number(process.env.PORT) || 9000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
