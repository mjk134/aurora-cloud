import { FastifyPluginAsync, FastifyRequest } from "fastify"
import { webhookRest } from "../../app.js" // i love this
import { UploadResponse } from "@repo/types"
import UserQueueHandler, { Handler, QueueHandler } from "../../handlers/queues.js"


const upload: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: Infinity // To allow large file uploads, but for even larger files you should stream them
    }
  })

  fastify.post('/', async function (request: FastifyRequest<{ Params: {
    userId: string | undefined
  } }>, reply) : Promise<UploadResponse> {
    const data = await request.file()
    const fileBuffer = await data?.toBuffer()

    request.log.info(`Data size is: ${fileBuffer?.byteLength} bytes.`)

    let params = new URLSearchParams(request.raw.url?.split('/upload')[1])

    const userId = params.get('userId')
    request.log.info(`User ID is: ${userId}`)

    if (!userId) {
      return {
        error: true,
        message: "no user"
      }
    }

    if (!fileBuffer) {
      return {
        error: true,
        message: "no file"
      } // ggwp buffer diff
    }
    // Load into queue and reurn response + file id

    const handler = new Handler(
      userId,
      {
        type: 'upload',
        data: {
          file: {
            name: data?.filename as string,
            type: data?.mimetype as string,
            size: fileBuffer.buffer.byteLength
          },
          buffer: fileBuffer
        }
      },
      webhookRest
    )

    if (!UserQueueHandler.getInstance().hasQueue(userId)) {
      UserQueueHandler.getInstance().setUserQueue(userId, new QueueHandler())
    }

    const queue = UserQueueHandler.getInstance().getUserQueue(userId);

    if (!queue) {
      return {
        error: true,
        message: "no queue"
      }
    }

    queue.addToQueue(handler)

    return {
      error: false,
      message: "success"
    }

  })
}

export default upload;
