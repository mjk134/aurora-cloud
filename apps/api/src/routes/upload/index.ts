import { FastifyPluginAsync } from "fastify"

const upload: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.register(import('@fastify/multipart'))

  fastify.post('/', async function (request, reply) {
    const data = await request.file()

    return 'this is an user endpoint'
  })
}

export default upload;
