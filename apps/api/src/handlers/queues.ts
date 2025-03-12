import { HandlerTaskUnion, UploadTaskData } from "./types";
import { client, tgClient } from "../app";
import {
  DiscordWebhookUploadAction,
  QueueItemType,
  TelegramWebhookUploadAction,
} from "@repo/types";
import { REST } from "./rest";
import { socketEventEmitter } from "../app";
import { encryptBuffer } from "./encryption";

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
  private types: QueueItemType[] = ["dc", "tg"]; // 'tt', 'yt' => Not implemented yet

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
      queueToUse = this.types[0]; //TODO: this is tempororay, instead check difference between queue lengths
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
   * - if the queue is empty return set processing to false
   * - process the item
   * - if the item is processed remove it from the queue
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
    // upload the file

    const encrypted = encryptBuffer(data.buffer);

    switch (itemType) {
      case "dc":
        // upload to discord
        const [_, dcResponse] = await client.uploadBufferFile({
          fileBuffer: encrypted.buf,
          eventEmitter: socketEventEmitter,
          userId: this.userId,
        });

        // Send the webhook
        this.rest.post(
          `/webhooks/upload/${this.userId}`,
          {
            body: JSON.stringify({
              file: data.file,
              folderId: data.folderId,
              data: {
                type: "dc",
                chunks: dcResponse.chunks,
                encrypted: {
                  iv: encrypted.iv,
                  key: encrypted.key,
                  authTag: encrypted.tag,
                },
              } as DiscordWebhookUploadAction,
            }),
          },
          true,
        );
        break;
      case "tg":
        // upload to telegram
        const [__, chunks] = await tgClient.uploadBufferFile({
          fileBuffer: encrypted.buf,
          eventEmitter: socketEventEmitter,
        });

        // Send the webhook
        this.rest.post(
          `/webhooks/upload/${this.userId}`,
          {
            body: JSON.stringify({
              file: data.file,
              folderId: data.folderId,
              data: {
                type: "tg",
                chunks: chunks,
                encrypted: {
                  iv: encrypted.iv,
                  key: encrypted.key,
                  authTag: encrypted.tag,
                },
              } as TelegramWebhookUploadAction,
            }),
          },
          true,
        );
        break;
    }
  }
}
