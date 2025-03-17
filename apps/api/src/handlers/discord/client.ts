import { REST } from "../rest.js";
import { Attachment, BlobPart, UploadChunkOptions } from "./types/index.js";
import { createDecipheriv, randomUUID } from "node:crypto";
import {
  DiscordResponse,
  WebsocketChunkEvent,
  WebsocketCompleteEvent,
  WebsocketInitEvent,
} from "@repo/types";
import EventEmitter from "node:events";
import CacheManager from "../cache.js";
import { ReadStream } from "node:fs";

export class Client {
  private _token: string;

  private rest: REST;
  private DEFAULT_CHANNEL = "949673655250599959";

  constructor(token: string) {
    this._token = token;
    // Create a new REST client
    this.rest = new REST({
      baseUrl: "https://discord.com/api/v10",
      headers: {
        Authorization: `Bot ${this.token}`,
        "User-Agent":
          "DiscordBot (https://github.com/mjk134/aurora-cloud, 0.0.1",
      },
    });
  }

  // Token getter
  get token() {
    return this._token;
  }

  private async uploadChunk({
    channelId,
    chunkId,
    fileId,
    chunkData,
  }: UploadChunkOptions): Promise<Attachment> {
    const data = new FormData();
    data.append("payload_json", JSON.stringify({ content: fileId }));
    data.append(
      `files[0]`,
      new Blob([chunkData], { type: "text/plain" }),
      chunkId,
    );
    const res = await this.rest.post(`/channels/${channelId}/messages`, {
      body: data,
    });
    const msg = (await res.json()) as Record<string, any>;
    if (msg.retry_after) {
      await new Promise((resolve) =>
        setTimeout(resolve, msg.retry_after * 1000),
      );
      return this.uploadChunk({ channelId, chunkId, fileId, chunkData });
    }

    const attachment = {
      ...msg.attachments[0],
      message_id: msg.id,
    };
    return attachment as Attachment;
  }

  private chunkFile(file: Buffer): Buffer[] {
    const chunkSize = 10 * 1024 * 1024;
    const maxChunks = Math.ceil(file.length / chunkSize);
    const chunks = [];
    for (let i = 0; i < maxChunks; i++) {
      const start = i * chunkSize;
      const end = (i + 1) * chunkSize;
      chunks.push(file.slice(start, end));
    }
    return chunks;
  }

  /**
   * Main upload function. Recieves a file buffer from client and uploads it to discord.
   */
  public async uploadBufferFile({
    channelId,
    fileBuffer,
    eventEmitter,
    userId,
    tempFileId,
  }: {
    channelId?: string;
    fileBuffer: Buffer;
    eventEmitter: EventEmitter;
    userId: string;
    tempFileId: string;
  }): Promise<DiscordResponse> {
    const fileId = randomUUID();
    const chunks = this.chunkFile(fileBuffer);
    // Initalisation complete
    eventEmitter.emit(
      "message",
      JSON.stringify({
        event: "init",
        fileId: tempFileId,
        chunks: chunks.length,
        user_id: userId,
      } as WebsocketInitEvent),
    );
    const attachments: Attachment[] = [];
    // Loop over chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk) {
        console.log("Failed to read chunk", i, chunk);
        eventEmitter.emit(
          "message",
          JSON.stringify({
            event: "chunk",
            fileId: tempFileId,
            chunk: i,
            proccessed: false,
            user_id: userId,
            progress: (i + 1) / chunks.length,
          } as WebsocketChunkEvent),
        );
        continue;
      }
      const attachment = await this.uploadChunk({
        channelId: channelId ?? this.DEFAULT_CHANNEL,
        chunkId: randomUUID(),
        fileId,
        chunkData: chunk as unknown as BlobPart,
      });
      attachments.push(attachment);
      eventEmitter.emit(
        "message",
        JSON.stringify({
          event: "chunk",
          fileId: tempFileId,
          chunk: i,
          progress: (i + 1) / chunks.length,
          proccessed: true,
          user_id: userId,
        } as WebsocketChunkEvent),
      );
    }
    eventEmitter.emit(
      "message",
      JSON.stringify({
        event: "complete",
        fileId: tempFileId,
        user_id: userId,
      } as WebsocketCompleteEvent),
    );
    return {
      chunks: attachments.map((a) => {
        return {
          url: a.url,
          message_id: a.message_id,
        };
      }),
    }
  }

  public async uploadStreamedFile({
    channelId,
    eventEmitter,
    userId,
    tempFileId,
    fileId,
  }: {
    channelId?: string;
    eventEmitter: EventEmitter;
    userId: string;
    tempFileId: string;
    fileId: string;
  }): Promise<DiscordResponse> {
    const cacheManager = CacheManager.getInstance();
    const readStream = cacheManager.getFileReadStreamFromCache(
      fileId,
      10 * 1024 * 1024,
    );
    const attachments: Attachment[] = [];
    const totalChunks = Math.ceil(
      cacheManager.getFileData(fileId)!.length /
        (10 * 1024 * 1024),
    );
    eventEmitter.emit(
      "message",
      JSON.stringify({
        event: "init",
        fileId: tempFileId,
        user_id: userId,
        chunks: totalChunks,
      } as WebsocketInitEvent),
    );

    let chunkCount = 0;
    for await (const chunk of readStream) {
      const attachment = await this.uploadChunk({
        channelId: channelId ?? this.DEFAULT_CHANNEL,
        chunkId: randomUUID(),
        fileId,
        chunkData: Uint8Array.from(chunk as Buffer),
      });
      attachments.push(attachment);
      eventEmitter.emit(
        "message",
        JSON.stringify({
          event: "chunk",
          fileId: tempFileId,
          progress: (chunkCount + 1) / totalChunks,
          proccessed: true,
          user_id: userId,
        } as WebsocketChunkEvent),
      );
      chunkCount++;
    }

    eventEmitter.emit(
      "message",
      JSON.stringify({
        event: "complete",
        fileId: tempFileId,
        user_id: userId,
      } as WebsocketCompleteEvent),
    );

    return {
      chunks: attachments.map((a) => {
        return {
          url: a.url,
          message_id: a.message_id,
        };
      }),
    }
  }

  public async downloadFile({
    chunks,
    eventEmitter,
    userId,
    fileId,
    filename,
  }: {
    chunks: { message_id: string; channel_id: string }[];
    eventEmitter: EventEmitter;
    userId: string;
    fileId: string;
    filename: string;
  }): Promise<Buffer> {
    const bufArr = [];
    eventEmitter.emit(
      "message",
      JSON.stringify({
        event: "init",
        fileId: fileId,
        chunks: chunks.length,
        user_id: userId,
        file_name: filename,
        type: "downloading",
      } as WebsocketInitEvent),
    );
    const messages = await this.getAttachmentUrls(chunks);
    // Loop over chunk urls
    for (let i = 0; i < messages.length; i++) {
      const url = messages[i];
      // Extract message id and fetch if no url content available (only do once, if fail do it for the rest)
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      // Fetch returns array buffer so we have to convert to a normal buffer (just changing classes, might cause perf issues)
      bufArr.push(new Uint8Array(buf));
      eventEmitter.emit(
        "message",
        JSON.stringify({
          event: "chunk",
          fileId: fileId,
          chunk: i,
          progress: (i + 1) / chunks.length,
          proccessed: true,
          user_id: userId,
        } as WebsocketChunkEvent),
      );
    }
    // Concat to get the final buffer for the file
    return Buffer.concat(bufArr);
  }

  public async downloadStreamedFileWithDecryption({
    chunks,
    eventEmitter,
    userId,
    fileId,
    filename,
    key,
    iv,
    tag
  }: {
    chunks: { message_id: string; channel_id: string }[];
    eventEmitter: EventEmitter;
    userId: string;
    fileId: string;
    filename: string;
    key: Uint8Array,
    iv: Uint8Array,
    tag: Uint8Array,
  }): Promise<ReadStream> {
    const cacheManager = CacheManager.getInstance()
    const writeStream = cacheManager.createFileWriteStreamToCache(fileId)
    eventEmitter.emit(
      "message",
      JSON.stringify({
        event: "init",
        fileId: fileId,
        chunks: chunks.length,
        user_id: userId,
        file_name: filename,
        type: "downloading",
      } as WebsocketInitEvent),
    );
    const decipher = createDecipheriv("aes-192-gcm", key, iv, {
      authTagLength: 16,
    });
    decipher.setAuthTag(tag);
    const urls = await this.getAttachmentUrls(chunks);

    for (let i = 0; i < urls.length; i++) {
      const res = await fetch(urls[i]);
      const arrayBuffer = await res.arrayBuffer();
      console.log("Downloaded chunk:", arrayBuffer.byteLength);
      const decrypted = decipher.update(new Uint8Array(arrayBuffer));
      writeStream.write(decrypted);
      eventEmitter.emit(
        "message",
        JSON.stringify({
          event: "chunk",
          fileId: fileId,
          chunk: i,
          progress: (i + 1) / chunks.length,
          proccessed: true,
          user_id: userId,
        } as WebsocketChunkEvent),
      );
    }
    decipher.final();
    writeStream.close();
    return cacheManager.getFileReadStreamFromCache(fileId);
  }

  private async getAttachmentUrls(chunks: {
    message_id: string;
    channel_id: string;
  }[]): Promise<string[]> {
    const urls = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const url = await this.getAttachmentUrl(chunk);
      urls.push(url);
    }
    return urls;
  }

  private async getAttachmentUrl(chunk: {
    message_id: string;
    channel_id: string;
  }): Promise<string> {
    const msg_id = chunk.message_id;
    const channel_id = chunk.channel_id;
    const msg = await this.rest.get(
      `/channels/${channel_id}/messages/${msg_id}`,
    );
    try {
      const d = (await msg.json()) as Record<string, any>;

      // If too many chunks, wait and retry
      if (d.retry_after) {
        await new Promise((resolve) =>
          setTimeout(resolve, d.retry_after * 1000),
        );
        return this.getAttachmentUrl(chunk);
      }
      return d.attachments[0].url as string;
    } catch (e) {
      console.log("Error fetching attachment", e, await msg.text());
      return "";
    }
  }
}
