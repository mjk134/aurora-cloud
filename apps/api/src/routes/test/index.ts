import { FastifyPluginAsync } from "fastify"
import { tgClient } from "../../app"

const test: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    const path = await tgClient.getFile({ fileId: 'BQACAgQAAxkDAAM3Z8l4s5o1k2DTRVv1sCljeAABD4TuAAIpFgACPitRUhXnnB6qMJQFNgQ' })
    
    if (!path) {
      return 'failed to get file'
    }

    const buffer = await tgClient.downloadFileChunk({ filePath: path })

    reply.header('Content-Disposition', `filename=test.pdf;`);
    reply.header('Content-Type', 'application/pdf');

    return buffer
  })
}

export default test;
