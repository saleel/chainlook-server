import { FastifyReply, FastifyRequest } from 'fastify';
import { generateNonce, SiweMessage } from 'siwe';
import { Web3StorageService } from './services/web3storage';
import publishDashboardUseCase from '../use-cases/publish-dashboard';
import { DashboardDefinition, WidgetDefinition } from '../common/types';
import newWidgetUseCase from '../use-cases/new-widget';
import widgetSchema from '../schemas/widget.json';
import dashboardSchema from '../schemas/dashboard.json';
import DashboardRepository from './repository/dashboard-repository';
import db from './db';
import WidgetRepository from './repository/widget-repository';
import getWidgetUseCase from '../use-cases/get-widget';
import editWidgetUseCase from '../use-cases/edit-widget';
import Widget from '../domain/widget';
import signInUseCase from '../use-cases/sign-in';
import UserRepository from './repository/user-repository';
import editProfileUseCase from '../use-cases/edit-profile';

// const web3Storage = new Web3StorageService(process.env.WEB3STORAGE_TOKEN as string);
// const dashboardRepository = new DashboardRepository(db);
const widgetRepository = new WidgetRepository(db);
const userRepository = new UserRepository(db);

const routes = [
  {
    method: 'GET',
    url: '/nonce',
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      reply.header('Content-Type', 'text/plain');
      reply.send(generateNonce());
    },
  },
  {
    method: 'POST',
    url: '/sign-in',
    handler: async (
      request: FastifyRequest<{
        Body: { message: string; signature: string };
      }>,
      reply: FastifyReply,
    ) => {
      const { message, signature } = request.body;
      try {
        const { token, user } = await signInUseCase({ message, signature }, { userRepository });
        reply.send({
          token,
          user,
        });
      } catch (err) {
        reply.log.error(err);
        reply.status(500);
        reply.send();
      }
    },
  },
  {
    method: 'GET',
    url: '/widgets/:id',
    handler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      const widgetId = request.params.id;

      const widget = await getWidgetUseCase(widgetId, {
        widgetRepository,
      });

      reply.send(widget);
    },
  },
  {
    method: 'POST',
    url: '/widget',
    schema: {
      body: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          definition: widgetSchema,
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    config: {
      requireAuth: true,
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const input = request.body as {
        definition: WidgetDefinition;
        id: string;
        title: string;
        tags: string[];
      };

      const widget = await newWidgetUseCase(input, {
        widgetRepository,
        user: request.user,
      });

      reply.send(widget);
    },
  },
  {
    method: 'PATCH',
    url: '/widget/:widgetId',
    schema: {
      body: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          definition: widgetSchema,
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    config: {
      requireAuth: true,
    },
    handler: async (
      request: FastifyRequest<{ Params: { widgetId: 'string' } }>,
      reply: FastifyReply,
    ) => {
      const widgetData = request.body as Widget;
      const { widgetId } = request.params;

      const widget = await editWidgetUseCase(widgetId, widgetData, {
        widgetRepository,
        user: request.user,
      });

      reply.send(widget);
    },
  },
  {
    method: 'PATCH',
    url: '/profile',
    schema: {
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
        },
      },
    },
    config: {
      requireAuth: true,
    },
    handler: async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      const { username } = request.body as { username: string };

      const user = await editProfileUseCase({ username }, {
        userRepository,
        user: request.user,
      });

      reply.send(user);
    },
  },
];

export default routes;
