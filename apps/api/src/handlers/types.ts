import { QueueItemType } from "@repo/types";
import { Handler } from "./queues";

interface HandlerTask {}

export type UploadTaskData = {
  file: {
    name: string;
    type: string;
    size: number;
  };
  fileId: string;
  folderId: string;
  tempFileId: string;
  encrypted: {
    iv: Buffer;
    key: Buffer;
    authTag: Buffer;
  }
};
export interface UploadTask extends HandlerTask {
  data: UploadTaskData;
  type: "upload";
}

export interface AvgWaitTimeTask extends HandlerTask {
  type: "averageWaitTime";
}

export interface StatusTask extends HandlerTask {
  type: "status";
}

export type HandlerTaskUnion = UploadTask | AvgWaitTimeTask | StatusTask;

export type QueueItem = {
  type: QueueItemType;
  handler: Handler;
};
export type EncrytedFileCacheInfo = {
  fileId: string;
  key: Buffer;
  iv: Buffer;
  tag: Buffer;
  length: number;
};
