import { FastifyReply, FastifyRequest } from 'fastify';
import { generateNonce } from 'siwe';
// import { Web3StorageService } from './services/web3storage';
import newWidgetUseCase from '../use-cases/create-widget';
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
import findWidgetsUseCase from '../use-cases/find-widgets';
import Dashboard from '../domain/dashboard';
import createDashboardUseCase from '../use-cases/create-dashboard';
import getDashboardUseCase from '../use-cases/get-dashboard';
import editDashboardUseCase from '../use-cases/edit-dashboard';
import findDashboardsUseCase from '../use-cases/find-dashboards';
import starDashboardUseCase from '../use-cases/star-dashboard';

// const web3Storage = new Web3StorageService(process.env.WEB3STORAGE_TOKEN as string);
const dashboardRepository = new DashboardRepository(db);
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
        const { token, user } = await signInUseCase(
          { message, signature },
          { userRepository },
        );
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
    url: '/widgets',
    handler: async (
      request: FastifyRequest<{ Querystring: { userId: string, userUsername: string, search: string, sort: Partial<keyof Widget>, order: 'asc' | 'desc', limit: number } }>,
      reply: FastifyReply,
    ) => {
      const {
        userId, sort, order, limit, userUsername, search,
      } = request.query;

      const widget = await findWidgetsUseCase(
        {
          userId, sort, sortOrder: order, limit, userUsername, search,
        },
        {
          widgetRepository,
        },
      );

      reply.send(widget);
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
    url: '/widgets',
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
      const input = request.body as Widget; // Similar structure of Widget used in API

      const widget = await newWidgetUseCase(input, {
        widgetRepository,
        user: request.user,
      });

      reply.send(widget);
    },
  },
  {
    method: 'PATCH',
    url: '/widgets/:widgetId',
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
      const widgetData = request.body as Partial<Widget>;
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
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { username } = request.body as { username: string };

      const user = await editProfileUseCase(
        { username },
        {
          userRepository,
          user: request.user,
        },
      );

      reply.send(user);
    },
  },
  {
    method: 'GET',
    url: '/dashboards',
    handler: async (
      request: FastifyRequest<{ Querystring: { userId: string, userUsername: string, search: string, sort: Partial<keyof Dashboard>, order: 'asc' | 'desc', limit: number, starredBy: string } }>,
      reply: FastifyReply,
    ) => {
      const {
        userId, limit, sort, order, starredBy, userUsername, search,
      } = request.query;

      const dashboards = await findDashboardsUseCase(
        {
          userId, limit, sort, sortOrder: order, starredBy, userUsername, search,
        },
        {
          dashboardRepository,
        },
      );

      return reply.send(dashboards);
    },
  },
  {
    method: 'GET',
    url: '/dashboards/:id',
    handler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      const dashboardId = request.params.id;

      const dashboard = await getDashboardUseCase(dashboardId, {
        dashboardRepository,
      });

      reply.send(dashboard);
    },
  },
  {
    method: 'POST',
    url: '/dashboards',
    schema: {
      body: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          slug: { type: 'string' },
          definition: dashboardSchema,
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    config: {
      requireAuth: true,
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const input = request.body as Dashboard; // Similar structure of Widget used in API

      const dashboard = await createDashboardUseCase(input, {
        dashboardRepository,
        user: request.user,
      });

      reply.send(dashboard);
    },
  },
  {
    method: 'PATCH',
    url: '/dashboards/:dashboardId',
    schema: {
      body: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          definition: dashboardSchema,
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    config: {
      requireAuth: true,
    },
    handler: async (
      request: FastifyRequest<{ Params: { dashboardId: 'string' } }>,
      reply: FastifyReply,
    ) => {
      const dashboardData = request.body as Partial<Dashboard>;
      const { dashboardId } = request.params;

      const dashboard = await editDashboardUseCase(dashboardId, dashboardData, {
        dashboardRepository,
        user: request.user,
      });

      reply.send(dashboard);
    },
  },
  {
    method: 'POST',
    url: '/star',
    schema: {
      body: {
        type: 'object',
        properties: {
          dashboardId: { type: 'string' },
          isStarred: { type: 'boolean' },
        },
      },
    },
    config: {
      requireAuth: true,
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { dashboardId, isStarred } = request.body as { dashboardId: string, isStarred: boolean };

      const updated = await starDashboardUseCase({ dashboardId, isStarred }, {
        dashboardRepository,
        user: request.user,
      });

      reply.send(updated);
    },
  },
];

export default routes;
