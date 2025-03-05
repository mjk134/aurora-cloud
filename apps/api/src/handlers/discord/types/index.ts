/* 
 * These types are local to the handler, hence they are not located in the shared folder.
 * Used mainly in the client.ts file.  
 */
import type { BinaryLike } from "crypto";

export type BlobPart = Blob | BinaryLike;

// Return type from discord?
export type Message = {
    content: string;
    [key: `files[${number}]`]: string;
    payload_json: ReturnType<typeof JSON.stringify>;
    attachments: Record<string, string>[];
}

// Returned from Discord?
export type Attachment = {
    id: string;
    filename: string;
    size: number;
    url: string;
    message_id: string;
}


// Function parameters
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