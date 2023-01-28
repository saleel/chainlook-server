import { FastifyReply, FastifyRequest } from 'fastify';
import { Web3StorageService } from './services/web3storage';
import publishDashboardUseCase from '../use-cases/publish-dashboard';
import { DashboardDefinition, WidgetDefinition } from '../common/types';
import publishWidgetUseCase from '../use-cases/publish-widget';
import widgetSchema from '../schemas/widget.json';
import dashboardSchema from '../schemas/dashboard.json';
import DashboardRepository from './repository/dashboard-repository';
import db from './db';
import WidgetRepository from './repository/widget-repository';

const web3Storage = new Web3StorageService(process.env.WEB3STORAGE_TOKEN as string);
const dashboardRepository = new DashboardRepository(db);
const widgetRepository = new WidgetRepository(db);

const routes = [
  {
    method: 'POST',
    url: '/publish-dashboard',
    schema: {
      body: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
          definition: dashboardSchema,
          signature: { type: 'string' },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const input = request.body as { definition: DashboardDefinition, slug: string, signature: string };

      const dashboard = await publishDashboardUseCase(input, {
        ipfsService: web3Storage,
        dashboardRepository,
      });

      reply.send(dashboard);
    },
  },
  {
    method: 'POST',
    url: '/publish-widget',
    schema: {
      body: {
        type: 'object',
        properties: {
          widget: widgetSchema,
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const input = request.body as { definition: WidgetDefinition, slug: string, signature: string };

      const widget = await publishWidgetUseCase(input, {
        ipfsService: web3Storage,
        widgetRepository,
      });

      reply.send(widget);
    },
  },
];

export default routes;
