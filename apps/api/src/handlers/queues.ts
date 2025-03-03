import EventEmitter from "node:events";
import { IHandler } from "./types";

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

    public addToQueue(task: HandlerTask): void {
        // iterate over the types and see which type is processing a handler
    }


}

class HandlerTask {
    private userId: string;
    private taskType: HandlerTaskType;
    private data: HandlerTaskData;

    constructor(userId: string, taskType: HandlerTaskType, data: HandlerTaskData) {
        this.userId = userId;
        this.taskType = taskType;
        this.data = data;
    }

    public async process(itemType: QueueItemType): Promise<void> {
        // process the task
        switch (this.taskType) {
            case 'upload':
                // await this.uploadFile(this.data.data, itemType);
                break;
        }
    }

    public async uploadFile(data: Buffer, itemType: QueueItemType): Promise<void> {
        // upload the file
        switch (itemType) {
            case 'dc':
                // upload to discord
                break;
            case 'tg':
                // upload to telegram
                break;
        }
    }


}

type HandlerTaskType = 'download' | 'upload' | 'averageWaitTime' | 'status';


type QueueItemType = 'dc' | 'tg' | 'tt' | 'yt' // discord, telegram, tiktok, youtube

type QueueItem = {
    type: QueueItemType;
    handler: HandlerTask;
};

type HandlerTaskData = {
    type: 'upload',
    data: Buffer;
} | {
    type: 'download',
    data: null
}