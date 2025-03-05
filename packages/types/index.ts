export * from "./discord";
export * from "./webhook"

// Type abastraction for easy reading
export type FileID = string;

// This is the response from the API when a file is uploaded
export interface UploadResponse {
    error?: boolean;
    message: string;
}

// All possible storage types returned by API based on queue priority
export type QueueItemType = 'dc' | 'tg' | 'tt' | 'yt' // discord, telegram, tiktok, youtube