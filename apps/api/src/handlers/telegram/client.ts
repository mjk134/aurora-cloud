import { randomUUID } from "node:crypto";
import { REST } from "../rest";
import { EventEmitter } from "node:stream";
import { BlobPart } from "../discord/types";
import {
  WebsocketChunkEvent,
  WebsocketCompleteEvent,
  WebsocketInitEvent,
} from "@repo/types";

export class TelegramClient {
  private _token: string;
  private rest: REST;
  private DEFAULT_CHAT_ID: string = "6361636845";
  private fileRest: REST;

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
    const chunkSize = 20 * 1024 * 1024; // 50 MB limit but 20 MB for bots
    const maxChunks = Math.ceil(file.length / chunkSize);
    const chunks = [];
    for (let i = 0; i < maxChunks; i++) {
      const start = i * chunkSize;
      const end = (i + 1) * chunkSize;
      chunks.push(file.slice(start, end));
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
  }): Promise<
    [
      string,
      {
        file_id: string;
      }[],
    ]
  > {
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
    eventEmitter.emit(
      "message",
      JSON.stringify({
        event: "complete",
        fileId: tempFileId,
        user_id: userId,
      } as WebsocketCompleteEvent),
    );
    return [
      fileId,
      messages.map((m) => {
        return {
          file_id: m,
        };
      }),
    ];
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
    const files = await Promise.all(
      fileIds.map((id) => this.getFile({ fileId: id })),
    );
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
    }
  }

  public async downloadFileChunk({
    filePath,
  }: {
    filePath: string;
  }): Promise<Buffer> {
    const res = await this.fileRest.get(`/${filePath}`);
    console.log("Downloaded file:", res);
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
