import { FastifyPluginAsync } from "fastify"
import { client } from "../../app.js" // i love this



const download: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    const { chunks }  = request.query as { chunks: string };
    // Recieving base64 json so must decode first
    const data = JSON.parse(Buffer.from(chunks, 'base64').toString()) as { file: string, chunks: Record<string, any>[] };

    request.log.info(data.chunks);
    // Download the file
    const buf = await client.downloadFile({ chunks: data.chunks });

    request.log.info(`Arr length: ${buf.byteLength}`)
    // REST HTTP file headers
    reply.header('Content-Disposition', `filename=${data.file};`);
    reply.header('Content-Type', 'application/octet-stream');

    return buf;
  })
}

export default download;