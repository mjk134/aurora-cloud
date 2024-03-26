import { FastifyPluginAsync } from "fastify"
import { client } from "../../app.js" // i love this


const upload: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: Infinity // the hell?? 
    }
  })

  fastify.post('/', async function (request, reply) {
    const data = await request.file()

    const fileBuffer = await data?.toBuffer()

    if (!fileBuffer) {
      return 'no file' // ggwp buffer diff
    }
  
    const res = await client.uploadBufferFile({ fileBuffer: fileBuffer })

    return res
  })
}

export default upload;
