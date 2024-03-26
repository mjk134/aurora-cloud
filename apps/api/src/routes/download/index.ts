import { FastifyPluginAsync } from "fastify"


const download: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    console.log('query params:', request.query);

    return 'hello'
  })
}

export default download;