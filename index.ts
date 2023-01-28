/* eslint-disable import/first */
import { config } from 'dotenv';

config();
import fastify, { RouteOptions } from 'fastify';
import fs from 'fs';
import routes from './infra/routes';

const server = fastify({ logger: true });

routes.forEach((r) => server.route(r as RouteOptions));

server.addSchema(JSON.parse(fs.readFileSync('./schemas/widget.json').toString()));
server.addSchema(JSON.parse(fs.readFileSync('./schemas/dashboard.json').toString()));

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
