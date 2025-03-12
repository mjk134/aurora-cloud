import { FastifyPluginAsync } from "fastify";
import { client, tgClient } from "../../app.js"; // i love this
import { DownloadDataUnion } from "@repo/types";
import { decryptBuffer } from "../../handlers/encryption.js";

const download: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    const { chunks } = request.query as { chunks: string };
    // Recieving base64 json so must decode first
    const data = JSON.parse(
      Buffer.from(chunks, "base64").toString(),
    ) as DownloadDataUnion;
    // Download the file

    console.log("Data:", data);

    let buf: Buffer | undefined;

    switch (data.type) {
      case "dc":
        // download from discord
        buf = await client.downloadFile({ chunks: data.chunks });
        break;
      case "tg":
        // download from telegram
        buf = await tgClient.donwloadFile({
          fileIds: data.chunks.map((c) => c.file_id),
        });
        break;
    }

    if (!buf) {
      throw new Error("Failed to download file");
    }

    request.log.info(`Arr length: ${buf.byteLength}`);
    // REST HTTP file headers
    reply.header("Content-Disposition", `filename=${data.file_name};`);
    reply.header("Content-Type", "application/octet-stream");

    const decrypted = decryptBuffer(
      buf,
      new Uint8Array(data.encrypted.key),
      new Uint8Array(data.encrypted.iv),
      new Uint8Array(data.encrypted.authTag),
    );
    return decrypted;
  });
};

export default download;
