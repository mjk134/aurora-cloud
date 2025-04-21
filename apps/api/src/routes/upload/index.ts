import { FastifyPluginAsync } from "fastify";
import { webhookRest } from "../../app.js"; // i love this
import { UploadResponse } from "@repo/types";
import CacheManager from "../../handlers/cache";
import UserQueueHandler, {
  Handler,
  QueueHandler,
} from "../../handlers/queues.js";
import { tryCatch } from "@repo/util";
import { EncrytedFileCacheInfo } from "../../handlers/types.js";

const upload: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.register(import("@fastify/multipart"), {
    limits: {
      fileSize: Infinity, // To allow large file uploads, but for even larger files it should be streamed
    },
  });

  fastify.post("/", async function (request, reply): Promise<UploadResponse> {
    const data = await request.file();
    if (!data) {
      return {
        error: true,
        message: "no file",
      };
    }

    const encryptedFileDataResult = await tryCatch<EncrytedFileCacheInfo>(
      CacheManager.getInstance().addEncryptedFileToCache({
        readable: data.file,
      }),
    );


    if (!encryptedFileDataResult.success) {
      return reply.status(500).send({
        error: true,
        message: "Failed to encrypt file.",
      });
    }



    let params = new URLSearchParams(request.raw.url?.split("/upload")[1]);
    const encryptedFileData = encryptedFileDataResult.value;
    const userId = params.get("userId");
    const folderId = params.get("folderId");
    const tempFileId = params.get("tempFileId");

    if (encryptedFileData.length === 0) {
      // Delete from cache
      await CacheManager.getInstance().removeFileFromCache(encryptedFileData.fileId);

      return reply.status(400).send({
        error: true,
        message: "no data",
      });
    }

    request.log.info(`User ID is: ${userId}. Folder ID is: ${folderId}.`);

    if (!folderId) {
      return reply.status(400).send({
        error: true,
        message: "no folder",
      });
    }

    if (!userId) {
      return reply.status(400).send({
        error: true,
        message: "no user",
      });
    }

    console.log(encryptedFileData.length + " bytes of data encrypted.");

    // Declare a handler for this upload
    const handler = new Handler(
      userId,
      {
        type: "upload",
        data: {
          file: {
            name: data?.filename as string, // Name of file incl. extension
            type: data?.mimetype as string, // MIME type
            size: encryptedFileData.length, // No. of bytes
          },
          encrypted: {
            iv: encryptedFileData.iv,
            key: encryptedFileData.key,
            authTag: encryptedFileData.tag,
          },
          fileId: encryptedFileData.fileId,
          folderId: folderId,
          tempFileId: tempFileId ? tempFileId : "none", // If no tempFileId, set to none
        },
      },
      webhookRest,
    );

    if (!UserQueueHandler.getInstance().hasQueue(userId)) {
      UserQueueHandler.getInstance().setUserQueue(userId, new QueueHandler());
    }

    const queue = UserQueueHandler.getInstance().getUserQueue(userId);

    if (!queue) {
      return reply.status(401).send({
        error: true,
        message: "no queue",
      });
    }

    // Push the handler to the queue
    queue.addToQueue(handler);

    return {
      error: false,
      message: "success",
    };
  });

  fastify.delete("/clear-queue", async function (request, reply) {
    const userId = request.body as string;

    if (!userId && typeof userId !== "string") {
      return reply.status(400).send({
        error: true,
        message: "no user provided",
      });
    }

    const userQueueHandler = UserQueueHandler.getInstance();

    if (!userQueueHandler) {
      return reply.status(401).send({
        error: true,
        message: "no queue",
      });
    }

    if (!userQueueHandler.hasQueue(userId)) {
      return reply.status(401).send({
        error: true,
        message: "no queue for user",
      });
    }

    request.log.info(`Clearing queue for user ${userId}.`);

    // Clear the queue for the user

    userQueueHandler.clearQueue(userId);

    return {
      error: false,
      message: "success",
    };
  });
};

export default upload;
