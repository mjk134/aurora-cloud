import { QueueItemType } from "@repo/types";
import { Handler } from "./queues";

interface HandlerTask {}


export type UploadTaskData = {
    file: {
        name: string;
        type: string;
        size: number;
    };
    buffer: Buffer;
}
export interface UploadTask extends HandlerTask {
    data: UploadTaskData;
    type: 'upload';

}

export interface DownloadTask extends HandlerTask {
    type: 'download';
}

export interface AvgWaitTimeTask extends HandlerTask {
    type: 'averageWaitTime';
}

export interface StatusTask extends HandlerTask {
    type: 'status';
}

export type HandlerTaskUnion = UploadTask | DownloadTask | AvgWaitTimeTask | StatusTask;


export type QueueItem = {
    type: QueueItemType;
    handler: Handler;
};

interface QueueItemData {}

export class DiscordDownloadData implements QueueItemData {
    public type: 'discord' = 'discord';
    public data: {
        chunkId: string;
        messageId: string;
    }[] = [];

    constructor() {}
}