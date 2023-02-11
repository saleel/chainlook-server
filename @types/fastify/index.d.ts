import fastify from 'fastify';
import User from '../../domain/user';

declare module 'fastify' {
  export interface FastifyRequest {
    user: User;
  }

  export interface FastifyContextConfig {
    requireAuth?: boolean
  }
}
