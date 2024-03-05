export type Message = {
    content: string;
    [key: `files[${number}]`]: string;
    payload_json: ReturnType<typeof JSON.stringify>;
    attachments: string[];
}

export type Attachment = {
    id: string;
    filename: string;
    size: number;
    url: string;
}

export interface UploadChunkOptions {
    channelId: string;
    chunkId: string;
    fileId: string;
    chunkData: BlobPart;
}

export interface UploadChunksOptions {
    channelId: string;
    chunkIds: string[];
    fileId: string;
    chunkData: BlobPart[];
}