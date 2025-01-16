import { FastifyPluginAsync } from "fastify"
import { tgClient } from "../../app"

const users: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    tgClient.sendMessage({ text: 'User endpoint hit' })
    return 'this is an user endpoint'
  })
}

export default users;
