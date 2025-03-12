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

interface DownloadData {
    encrypted: {
        iv: number[];
        key: number[];
        authTag: number[];
    }
}

export interface DiscordDownloadData extends DownloadData {
    type: 'dc';
    file_name: string;
    chunks: {
        channel_id: string;
        message_id: string;
    }[];
}

export interface TelegramDownloadData extends DownloadData {
    type: 'tg';
    file_name: string;
    chunks: {
        file_id: string;
    }[];
}

export type DownloadDataUnion = DiscordDownloadData | TelegramDownloadData;

interface WebsocketEvent {}

export interface WebsocketInitEvent extends WebsocketEvent {
    event: 'init';
    fileId: string;
    chunks: number;
    user_id: string;
}

export interface WebsocketChunkEvent extends WebsocketEvent {
    event: 'chunk';
    fileId: string;
    chunk: number;
    proccessed: boolean;
}

export interface WebsocketCompleteEvent extends WebsocketEvent {
    event: 'complete';
    fileId: string;
}

export type WebsocketEventUnion = WebsocketInitEvent | WebsocketChunkEvent | WebsocketCompleteEvent;