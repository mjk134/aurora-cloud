import { FastifyPluginAsync } from "fastify"

const users: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return 'this is an user endpoint'
  })
}

export default users;
