import { config } from 'dotenv';
import fastify from 'fastify';

config();
const server = fastify({ logger: true })

// Declare a route
server.get('/', async (request, reply) => {
  return { hello: 'world' }
})

// Run the server!
const start = async () => {
  try {
    await server.listen({ port: Number(process.env.PORT) || 9000 })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()