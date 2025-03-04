import EventEmitter from "node:events";
import { HandlerTaskDataUnion, QueueItem, QueueItemType } from "./types";
import { client, tgClient } from "../app";

export default class UserQueueHandler {
    private static instance: UserQueueHandler;
    private userQueueMap: Map<string, QueueHandler> = new Map<string, QueueHandler>();
    private eventEmitter = new EventEmitter();

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

    public async hasQueue(userId: string): Promise<boolean> {
        return this.userQueueMap.has(userId);
    }

}

class QueueHandler {
    private queueChannels = new Map<QueueItemType, QueueItem[]>();
    private processing = new Map<QueueItemType, boolean>();
    private types: QueueItemType[] = ['dc', 'tg', 'tt', 'yt'];

    constructor() {
        // For each can be used since the types are fixed
        this.types.forEach(type => {
            if (type === 'tt' || type === 'yt') return;
            this.queueChannels.set(type, []);
            this.processing.set(type, false);
        });
    }

    public addToQueue(task: Handler): void {
        // iterate over the types and see which type is processing a handler
    }

    public async processNext(type: QueueItemType): Promise<void> {
        // get the next item in the queue
        // if the queue is empty return
        // process the item
        // if the item is processed remove it from the queue

        const queue = this.queueChannels.get(type);
        if (!queue) return;
       //  if (this.processing.get(type)) return;
    }


}

export class Handler {
    private userId: string;
    private task: HandlerTaskDataUnion;
    private eventEmitter = new EventEmitter();

    constructor(userId: string, task: HandlerTaskDataUnion) {
        this.userId = userId;
        this.task = task;
    }

    public async process(itemType: QueueItemType): Promise<void> {
        // process the task
        switch (this.task.type) {
            case 'upload':
                await this.uploadFile(this.task.data, itemType);
                break;
            case 'download':
                await this.downloadFile(itemType);
        }
    }

    public async uploadFile(data: Buffer, itemType: QueueItemType): Promise<void> {
        // upload the file
        // Pass in the event emmiter expect inintialision and finish to be .once events and update chunk to be .on with chunk data progress

        this.eventEmitter.once('initialisation', () => {

        })
        this.eventEmitter.once('finish', () => {
            // Deattach emitters
            this.deattachEvents()

            // Webhook to client
        })
        this.eventEmitter.on('chunk', (progress) => {})
        this.eventEmitter.once('error', () => {
            this.deattachEvents()
        })


        switch (itemType) {
            case 'dc':
                // upload to discord
                await client.uploadBufferFile({
                    fileBuffer: data,
                    eventEmitter: this.eventEmitter
                })

                break;
            case 'tg':
                await tgClient.uploadBufferFile({
                    fileBuffer: data,
                    eventEmitter: this.eventEmitter
                })

                // upload to telegram
                break;
        }
    }

    public async downloadFile(itemType: QueueItemType): Promise<void> {

    }

    private deattachEvents(): void {
        this.eventEmitter.removeAllListeners('initialisation')
        this.eventEmitter.removeAllListeners('finish')
        this.eventEmitter.removeAllListeners('chunk')
    }


}