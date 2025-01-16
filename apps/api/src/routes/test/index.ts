import { FastifyPluginAsync } from "fastify"
import { tgClient } from "../../app.js" // i love this
import { UploadResponse } from "@repo/types"


const upload: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: Infinity // To allow large file uploads, but for even larger files you should stream them
    }
  })

  fastify.post('/', async function (request, reply) : Promise<UploadResponse> {
    const data = await request.file()

    const fileBuffer = await data?.toBuffer()
    request.log.info(`Data size is: ${fileBuffer?.byteLength} bytes.`)

    if (!fileBuffer) {
      return {
        error: true,
        message: "no file"
      } // ggwp buffer diff
    }
    // Load into queue and reurn response + file id
  
    const [fileId, dcResponse] = await tgClient.uploadBufferFile({ fileBuffer: fileBuffer });
    request.log.info('Sending response:', dcResponse)

    return {
      error: false,
      message: "file uploaded",
      fileId,
      type: "discord",
      discord: dcResponse
    }
  })
}

export default upload;
