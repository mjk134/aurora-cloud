import { HandlerTaskUnion, UploadTaskData } from "./types";
// @ts-ignore
import { client, tgClient } from "../app";
import {
  DiscordResponse,
  DiscordWebhookUploadAction,
  QueueItemType,
  // @ts-ignore
  TelegramWebhookUploadAction,
} from "@repo/types";
import { REST } from "./rest";
import { socketEventEmitter } from "../app";
import CacheManager from "./cache";
import { tryCatch } from "@repo/util";
import { TelegramResponse } from "./telegram/client";

/**
 * This class is used to handle the queue for each user.
 */
export default class UserQueueHandler {
  private static instance: UserQueueHandler;
  private userQueueMap: Map<string, QueueHandler> = new Map<
    string,
    QueueHandler
  >();

  private constructor() {}

  static getInstance(): UserQueueHandler {
    if (!UserQueueHandler.instance) {
      UserQueueHandler.instance = new UserQueueHandler();
    }
    return UserQueueHandler.instance;
  }

  public setUserQueue(userId: string, queue: QueueHandler): void {
    this.userQueueMap.set(userId, queue);
  }

  public getUserQueue(userId: string): QueueHandler | undefined {
    return this.userQueueMap.get(userId);
  }

  public hasQueue(userId: string): boolean {
    return this.userQueueMap.has(userId);
  }

  public clearQueue(userId: string): void {
    const queue = this.userQueueMap.get(userId);
    if (queue) {
      this.userQueueMap.delete(userId);
    }
  }
}

/**
 * This class is used to handle the queue for each type of item for a single user.
 */
export class QueueHandler {
  // Order of the types is important, it represents the priority of the queues
  private queueChannels: Map<QueueItemType, Handler[]> = new Map<
    QueueItemType,
    Handler[]
  >();
  private processing = new Map<QueueItemType, boolean>();
  private types: QueueItemType[] = ["tg", "dc"]; // 'tt', 'yt' => Not implemented yet

  constructor() {
    // For each can be used since the types are fixed
    this.types.forEach((type) => {
      if (type === "tt" || type === "yt") return;
      this.processing.set(type, false);
      this.queueChannels.set(type, []);
    });
  }

  public addToQueue(task: Handler): void {
    // iterate over the types and see which type is processing a handler
    let queueToUse: QueueItemType | undefined;

    // in case all queues are processing, add to the queue with the least amount of items
    for (const type of this.types) {
      if (type === "tt" || type === "yt") continue; // TODO: Not implemented yet
      if (!this.processing.get(type)) {
        queueToUse = type;
        break;
      } else {
        // If the queue size is only 1 then we can add to the queue
        if (this.queueChannels.get(type)?.length === 1) {
          queueToUse = type;
          break;
        }
      }
    }

    // If the queue lengths are all the same then we can add to any queue, use the most prioritized queue
    if (!queueToUse) {
      // Get queue with the least amount of items
      const dcLength = this.queueChannels.get("dc")?.length || 0;
      const tgLength = this.queueChannels.get("tg")?.length || 0;

      if (dcLength < tgLength) {
        queueToUse = "dc";
      } else {
        queueToUse = "tg";
      }
    }

    if (!queueToUse) return;
    const queue = this.queueChannels.get(queueToUse);
    console.log(queue); // Debugging
    if (queue) {
      queue.push(task);
      if (!this.processing.get(queueToUse)) {
        this.processNext(queueToUse);
      }
    }
  }

  /**
   * Process the next item in the queue:
   * - get the next item in the queue
   * - if the queue is empty return, set processing to false
   * - process the item
   * - if the item is processed remove it from the queue, repeat
   */
  public async processNext(type: QueueItemType): Promise<void> {
    const queue = this.queueChannels.get(type);
    console.log("process next", queue); // Debugging
    if (queue && queue.length > 0) {
      this.processing.set(type, true);
      const task = queue.shift();
      if (task) {
        await task.process(type);
        this.processNext(type);
      }
    } else {
      this.processing.set(type, false);
    }
  }
}

export class Handler {
  private userId: string;
  private task: HandlerTaskUnion;
  private rest: REST;

  constructor(userId: string, task: HandlerTaskUnion, rest: REST) {
    this.userId = userId; // Used for the webhook.
    this.task = task;
    this.rest = rest;
  }

  /**
   * Process the task based on the type of the task.
   */
  public async process(itemType: QueueItemType): Promise<void> {
    // process the task
    console.log(
      `Processing task for user ${this.userId}.\n Task type: ${this.task.type}.\n Location of 3rd party: ${itemType}.`,
    );
    switch (this.task.type) {
      case "upload":
        await this.uploadFile(this.task.data, itemType);
        break;
    }
  }

  public async uploadFile(
    data: UploadTaskData,
    itemType: QueueItemType,
  ): Promise<void> {
    const cacheManager = CacheManager.getInstance();
    // upload the file
    const fileLength = cacheManager.getFileData(data.fileId)?.length;
    if (!fileLength) {
      console.error("File not found in cache.");
      return;
    }
    console.log(`Uploading file ${data.file.name} with ${fileLength} bytes.`);

    switch (itemType) {
      // upload to discord
      case "dc":
        // If it will cause a memory error, upload the file in chunks
        const dcResult = await tryCatch<DiscordResponse>(
          (async () => {
            if (fileLength > 15 * 1024 * 1024) {
              return await client.uploadStreamedFile({
                eventEmitter: socketEventEmitter,
                userId: this.userId,
                tempFileId: data.tempFileId,
                fileId: data.fileId,
              });
            } else {
              return await client.uploadBufferFile({
                eventEmitter: socketEventEmitter,
                userId: this.userId,
                tempFileId: data.tempFileId,
                fileBuffer: await cacheManager.getFileBufferFromCache(
                  data.fileId,
                ),
              });
            }
          })(),
        );

        if (!dcResult.success) {
          console.warn("Error uploading file to discord:", dcResult.value);
          this.rest.post(
            `/webhooks/upload/${this.userId}?err=true&tempFileId=${data.tempFileId}`,
            {
              body: JSON.stringify({
                error: true,
                message: dcResult.value,
              }),
            },
            true,
          );
          return;
        }

        // Send the webhook
        this.rest.post(
          `/webhooks/upload/${this.userId}?err=false&tempFileId=${data.tempFileId}`,
          {
            body: JSON.stringify({
              file: data.file,
              folderId: data.folderId,
              data: {
                type: "dc",
                chunks: dcResult.value.chunks,
                encrypted: data.encrypted,
              } as DiscordWebhookUploadAction,
            }),
          },
          true,
        );
        break;
      case "tg":
        // upload to telegram
        const tgResult = await tryCatch<TelegramResponse>(
          (async () => {
            if (fileLength > 15 * 1024 * 1024) {
              return await tgClient.uploadStreamedFile({
                eventEmitter: socketEventEmitter,
                userId: this.userId,
                tempFileId: data.tempFileId,
                fileId: data.fileId,
              });
            } else {
              return await tgClient.uploadBufferFile({
                fileBuffer: await cacheManager.getFileBufferFromCache(
                  data.fileId,
                ),
                eventEmitter: socketEventEmitter,
                userId: this.userId,
                tempFileId: data.tempFileId,
              });
            }
          })(),
        );
        if (!tgResult.success) {
          console.warn("Error uploading file to telegram:", tgResult.value);
          this.rest.post(
            `/webhooks/upload/${this.userId}?err=true&tempFileId=${data.tempFileId}`,
            {
              body: JSON.stringify({
                error: true,
              }),
            },
            true,
          );
          return;
        }

        // Send the webhook
        this.rest.post(
          `/webhooks/upload/${this.userId}?err=false&tempFileId=${data.tempFileId}`,
          {
            body: JSON.stringify({
              file: data.file,
              folderId: data.folderId,
              data: {
                type: "tg",
                chunks: tgResult.value,
                encrypted: data.encrypted,
              } as TelegramWebhookUploadAction,
            }),
          },
          true,
        );
        break;
    }

    // Remove the file from the cache
    await cacheManager.removeFileFromCache(data.fileId);
  }
}
