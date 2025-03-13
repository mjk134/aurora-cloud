import { FastifyPluginAsync } from "fastify"
import { webhookRest } from "../../app.js" // i love this
import { UploadResponse } from "@repo/types"
import UserQueueHandler, { Handler, QueueHandler } from "../../handlers/queues.js"


const upload: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: Infinity // To allow large file uploads, but for even larger files it should be streamed
    }
  })

  fastify.post('/', async function (request, reply) : Promise<UploadResponse> {
    const data = await request.file()
    const fileBuffer = await data?.toBuffer()

    request.log.info(`Data size is: ${fileBuffer?.byteLength} bytes.`)

    let params = new URLSearchParams(request.raw.url?.split('/upload')[1])

    const userId = params.get('userId')
    const folderId = params.get('folderId')
    const tempFileId = params.get('tempFileId')
    request.log.info(`User ID is: ${userId}. Folder ID is: ${folderId}.`)

    if (!folderId) {
      return {
        error: true,
        message: "no folder"
      }
    }

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
      }
    }

    // Declare a handle for this upload
    const handler = new Handler(
      userId,
      {
        type: 'upload',
        data: {
          file: {
            name: data?.filename as string, // Name of file incl. extension
            type: data?.mimetype as string, // MIME type
            size: fileBuffer.buffer.byteLength // No. of bytes
          },
          buffer: fileBuffer,
          folderId: folderId,
          tempFileId: tempFileId ? tempFileId : "none" // If no tempFileId, set to none
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

    // Push the handler to the queue
    queue.addToQueue(handler)

    return {
      error: false,
      message: "success"
    }

  })
}

export default upload;
