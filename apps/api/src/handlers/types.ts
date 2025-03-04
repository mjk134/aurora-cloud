import { Handler } from "./queues";

interface HandlerTaskData {}

export class UploadTaskData implements HandlerTaskData {
    public data: Buffer;
    public type: 'upload' = 'upload';

    constructor(data: Buffer) {
        this.data = data;
    }
}

export class DownloadTaskData implements HandlerTaskData {
    public type: 'download' = 'download';
}

export class AvgWaitTimeTaskData implements HandlerTaskData {
    public type: 'averageWaitTime' = 'averageWaitTime';
}

export class StatusTaskData implements HandlerTaskData {
    public type: 'status' = 'status';
}

export type HandlerTaskDataUnion = UploadTaskData | DownloadTaskData | AvgWaitTimeTaskData | StatusTaskData;


export type QueueItemType = 'dc' | 'tg' | 'tt' | 'yt' // discord, telegram, tiktok, youtube

export type QueueItem = {
    type: QueueItemType;
    handler: Handler;
};