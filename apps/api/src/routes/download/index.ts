import { FastifyPluginAsync } from "fastify";
import { client, socketEventEmitter, tgClient } from "../../app.js"; // i love this
import { DownloadDataUnion, WebsocketCompleteEvent } from "@repo/types";
import { decryptBuffer } from "../../handlers/encryption.js";
import { Readable } from "stream";
import CacheManager from "../../handlers/cache.js";
import { tryCatch, tryCatchSync } from "@repo/util";

const download: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    const { chunks } = request.query as { chunks: string };
    // function as described by MDN
    const reviver = (key: string, value: unknown) =>
      value !== null &&
      typeof value === "object" &&
      "$bigint" in value &&
      typeof value.$bigint === "string"
        ? BigInt(value.$bigint)
        : value;

    // Recieving base64 json so must decode first
    const data = JSON.parse(
      Buffer.from(chunks, "base64").toString(),
      reviver,
    ) as DownloadDataUnion;
    // Download the file

    request.log.info(`Downloading file, with length: ${data.file_length}, type: ${typeof data.file_length}`);
    console.log("Data:", data);

    let buf: Buffer | undefined;
    let stream: Readable | undefined;
    request.log.info(`Is less than 15MB: ${BigInt(data.file_length as bigint) < BigInt(15728640)}`)

    if (BigInt(data.file_length as bigint) < BigInt(15728640)) {
      let buffer: Buffer;

      const result = await tryCatch<Buffer>((async () => {
        switch (data.type) {
          case "dc":
            // download from discord
            return await client.downloadFile({
              chunks: data.chunks,
              userId: data.user_id,
              fileId: data.file_id,
              eventEmitter: socketEventEmitter,
              filename: data.file_name,
            });
          case "tg":
            // download from telegram
            return await tgClient.downloadFile({
              fileIds: data.chunks.map((c) => c.file_id),
              userId: data.user_id,
              fileId: data.file_id,
              eventEmitter: socketEventEmitter,
              filename: data.file_name,
            });
        }
      })())

      if (!result.success) {
        return reply.status(500).send({
          error: "Failed to download file",
          message: result.value.message,
        });
      }

      buffer = result.value;
      request.log.info(`Arr length: ${buffer.byteLength}`);
      request.log.info("Arr length:", buffer.length);

      const decryptResult = tryCatchSync<Buffer>(() => {
        return decryptBuffer(
          buffer,
          new Uint8Array(data.encrypted.key),
          new Uint8Array(data.encrypted.iv),
          new Uint8Array(data.encrypted.authTag),
        );
      })

      if (!decryptResult.success) {
        return reply.status(500).send({
          error: "Failed to decrypt file",
          message: decryptResult.value.message,
        });
      }

      buf = decryptResult.value;
    } else if ((data.file_length as bigint) > BigInt(15728640)) {
      // Proccess stream

      const result = await tryCatch<Readable>((async () => {
        switch (data.type) {
          case "dc":
            // download from discord
            return await client.downloadStreamedFileWithDecryption({
              chunks: data.chunks,
              userId: data.user_id,
              fileId: data.file_id,
              eventEmitter: socketEventEmitter,
              filename: data.file_name,
              key: new Uint8Array(data.encrypted.key),
              iv: new Uint8Array(data.encrypted.iv),
              tag: new Uint8Array(data.encrypted.authTag),
            })
            break;
          case "tg":
            // download from telegram
            return await tgClient.downloadStreamedFileWithDecryption({
              fileIds: data.chunks.map((c) => c.file_id),
              userId: data.user_id,
              fileId: data.file_id,
              eventEmitter: socketEventEmitter,
              filename: data.file_name,
              key: new Uint8Array(data.encrypted.key),
              iv: new Uint8Array(data.encrypted.iv),
              tag: new Uint8Array(data.encrypted.authTag),
            })
            break;
        }
      })())

      if (!result.success) {
        return reply.status(500).send({
          error: "Failed to download file",
          message: result.value.message,
        });
      }
      stream = result.value;
    }

    socketEventEmitter.emit(
      "message",
      JSON.stringify({
        event: "complete",
        fileId: data.file_id,
        user_id: data.user_id,
      } as WebsocketCompleteEvent),
    );

    
    // REST HTTP file headers
    reply.header("Content-Disposition", `filename=${data.file_name};`);
    reply.header("Content-Type", "application/octet-stream");

    await reply.send(buf ?? stream);

    // Delete the file from cache
    await CacheManager.getInstance().removeFileFromCache(data.file_id);
  });
};

export default download;
