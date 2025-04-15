import { createDecipheriv, randomUUID } from "node:crypto";
import { REST } from "../rest";
import { EventEmitter } from "node:stream";
import { BlobPart } from "../discord/types";
import { WebsocketChunkEvent, WebsocketInitEvent } from "@repo/types";
import CacheManager from "../cache";
import { ReadStream } from "node:fs";

export type TelegramResponse = {
  file_id: string;
}[];

export class TelegramClient {
  private _token: string;
  private rest: REST;
  private DEFAULT_CHAT_ID: string = "6361636845";
  private fileRest: REST;
  private DEFAULT_CHUNK_SIZE = 20 * 1024 * 1024;

  constructor(token: string) {
    this._token = token;
    this.rest = new REST({
      baseUrl: `https://api.telegram.org/bot${this._token}`,
    });
    this.fileRest = new REST({
      baseUrl: `https://api.telegram.org/file/bot${this._token}`,
    });
  }

  private chunkFile(file: Buffer): Buffer[] {
    const chunkSize = this.DEFAULT_CHUNK_SIZE; // 50 MB limit but 20 MB for bots
    const maxChunks = Math.ceil(file.length / chunkSize);
    const chunks = [];
    for (let i = 0; i < maxChunks; i++) {
      const start = i * chunkSize;
      const end = (i + 1) * chunkSize;
      chunks.push(file.subarray(start, end));
    }
    return chunks;
  }

  public async uploadChunk({
    chatId,
    chunkId,
    fileId,
    chunkData,
  }: {
    chatId?: string;
    chunkId: string;
    fileId: string;
    chunkData: Buffer;
  }): Promise<string> {
    const data = new FormData();
    data.append("chat_id", chatId ?? this.DEFAULT_CHAT_ID);
    data.append(
      "document",
      new Blob([chunkData as unknown as BlobPart], { type: "text/plain" }),
      chunkId,
    );
    const res = await this.rest.post(`/sendDocument`, { body: data });
    const msg = (await res.json()) as {
      ok: boolean;
      result: {
        message_id: number;
        document: {
          file_id: string;
        };
      };
    };
    if (!msg.ok) {
      // Retry
      console.log("Failed to upload chunk, retrying...", msg);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return await this.uploadChunk({ chatId, chunkId, fileId, chunkData });
    }
    return msg.result.document.file_id;
  }

  public async uploadBufferFile({
    chatId,
    fileBuffer,
    eventEmitter,
    tempFileId,
    userId,
  }: {
    chatId?: string;
    fileBuffer: Buffer;
    eventEmitter: EventEmitter;
    tempFileId: string;
    userId: string;
  }): Promise<TelegramResponse> {
    const fileId = randomUUID();
    const chunks = this.chunkFile(fileBuffer);
    eventEmitter.emit(
      "message",
      JSON.stringify({
        event: "init",
        fileId: tempFileId,
        chunks: chunks.length,
        user_id: userId,
      } as WebsocketInitEvent),
    );
    const messages = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk) {
        console.log("Failed to read chunk", i, chunk);
        eventEmitter.emit(
          "message",
          JSON.stringify({
            event: "chunk",
            fileId: tempFileId,
            chunk: i + 1,
            proccessed: false,
            user_id: userId,
            progress: i / chunks.length,
          } as WebsocketChunkEvent),
        );
        continue;
      }
      const document = await this.uploadChunk({
        chatId: chatId ?? this.DEFAULT_CHAT_ID,
        chunkId: randomUUID(),
        fileId,
        chunkData: chunk,
      });
      messages.push(document);
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
    return messages.map((m) => {
      return {
        file_id: m,
      };
    });
  }

  public async uploadStreamedFile({
    chatId,
    eventEmitter,
    tempFileId,
    userId,
    fileId,
  }: {
    chatId?: string;
    eventEmitter: EventEmitter;
    tempFileId: string;
    userId: string;
    fileId: string;
  }): Promise<TelegramResponse> {
    const cacheManager = CacheManager.getInstance();
    const readStream = cacheManager.getFileReadStreamFromCache(
      fileId,
      this.DEFAULT_CHUNK_SIZE,
    );
    const totalChunks = Math.ceil(
      cacheManager.getFileData(fileId)!.length / this.DEFAULT_CHUNK_SIZE,
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

    const messages = [];
    let i = 0;
    for await (const chunk of readStream) {
      const document = await this.uploadChunk({
        chatId: chatId ?? this.DEFAULT_CHAT_ID,
        chunkId: randomUUID(),
        fileId,
        chunkData: chunk,
      });
      messages.push(document);
      eventEmitter.emit(
        "message",
        JSON.stringify({
          event: "chunk",
          fileId: tempFileId,
          chunk: i,
          progress: (i + 1) / totalChunks,
          proccessed: true,
          user_id: userId,
        } as WebsocketChunkEvent),
      );
      i++;
    }

    return messages.map((m) => {
      return {
        file_id: m,
      };
    });
  }

  public async downloadFile({
    fileIds,
    eventEmitter,
    userId,
    fileId,
    filename,
  }: {
    fileIds: string[];
    eventEmitter: EventEmitter;
    userId: string;
    fileId: string;
    filename: string;
  }): Promise<Buffer> {
    const chunkArr = [];
    eventEmitter.emit(
      "message",
      JSON.stringify({
        event: "init",
        fileId: fileId,
        chunks: fileIds.length,
        user_id: userId,
        file_name: filename,
        type: "downloading",
      } as WebsocketInitEvent),
    );
    const files = [];

    for (const fileId of fileIds) {
      files.push(await this.getFile({ fileId: fileId }));
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const chunk = await this.downloadFileChunk({ filePath: file });
        chunkArr.push(new Uint8Array(chunk));
        eventEmitter.emit(
          "message",
          JSON.stringify({
            event: "chunk",
            fileId: fileId,
            chunk: i,
            progress: (i + 1) / fileIds.length,
            proccessed: true,
            user_id: userId,
          } as WebsocketChunkEvent),
        );
      }
    }
    return Buffer.concat(chunkArr);
  }

  public async downloadStreamedFileWithDecryption({
    fileIds,
    eventEmitter,
    userId,
    fileId,
    filename,
    key,
    iv,
    tag,
  }: {
    fileIds: string[];
    eventEmitter: EventEmitter;
    userId: string;
    fileId: string;
    filename: string;
    key: Uint8Array;
    iv: Uint8Array;
    tag: Uint8Array;
  }): Promise<ReadStream> {
    const cacheManager = CacheManager.getInstance();
    const writeStream = cacheManager.createFileWriteStreamToCache(fileId);
    eventEmitter.emit(
      "message",
      JSON.stringify({
        event: "init",
        fileId: fileId,
        chunks: fileIds.length,
        user_id: userId,
        file_name: filename,
        type: "downloading",
      } as WebsocketInitEvent),
    );
    const decipher = createDecipheriv("aes-192-gcm", key, iv, {
      authTagLength: 16,
    });
    decipher.setAuthTag(tag);

    const files = [];

    for (const fileId of fileIds) {
      files.push(await this.getFile({ fileId: fileId }));
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const chunk = await this.downloadFileChunk({ filePath: file });
        const decryptedChunk = decipher.update(new Uint8Array(chunk));
        writeStream.write(decryptedChunk);
        eventEmitter.emit(
          "message",
          JSON.stringify({
            event: "chunk",
            fileId: fileId,
            chunk: i,
            progress: (i + 1) / fileIds.length,
            proccessed: true,
            user_id: userId,
          } as WebsocketChunkEvent),
        );
      }
    }
    decipher.final();
    writeStream.close();
    return cacheManager.getFileReadStreamFromCache(fileId);
  }

  public async sendMessage({
    chatId = this.DEFAULT_CHAT_ID,
    text,
  }: {
    chatId?: string;
    text: string;
  }): Promise<void> {
    const data = await this.rest.post(
      `/sendMessage`,
      {
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
      },
      true,
    );
    console.log("Sent message:", await data.json());
  }

  public async getFile({
    fileId,
  }: {
    fileId: string;
  }): Promise<string | undefined> {
    const data = await this.rest.get(`/getFile?file_id=${fileId}`);
    const fileInfo = (await data.json()) as {
      ok: boolean;
      result: {
        file_id: string;
        file_unique_id: string;
        file_size: number;
        file_path: string;
      };
    };

    if (fileInfo.ok) {
      return fileInfo.result.file_path;
    } else {
      // Retry
      console.log("Failed to get file, retrying...", fileInfo);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return await this.getFile({ fileId });
    }
  }

  public async downloadFileChunk({
    filePath,
  }: {
    filePath: string;
  }): Promise<Buffer> {
    const res = await this.fileRest.get(`/${filePath}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  public async getMe(): Promise<void> {
    const data = await this.rest.get(`/getMe`);
    console.log("Bot info:", await data.json());
  }

  public async getUpdates(): Promise<void> {
    const data = await this.rest.get(`/getUpdates`);
    console.table(((await data.json()) as any).result[0].message);
  }
}
