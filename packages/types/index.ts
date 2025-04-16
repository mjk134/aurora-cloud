export * from "./discord";
export * from "./webhook"

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
    };
    user_id: string;
    file_name: string;
    file_id: string;
    file_length: BigInt;
}

export interface DiscordDownloadData extends DownloadData {
    type: 'dc';
    chunks: {
        channel_id: string;
        message_id: string;
    }[];
}

export interface TelegramDownloadData extends DownloadData {
    type: 'tg';
    
    chunks: {
        file_id: string;
    }[];
}

export type DownloadDataUnion = DiscordDownloadData | TelegramDownloadData;

interface WebsocketEvent {}

export interface WebsocketInitEvent extends WebsocketEvent {
    event: 'init';
    fileId: string;
    user_id: string;
    chunks: number;
    type?: 'downloading' | 'uploading';
    file_name?: string;
}

export interface WebsocketChunkEvent extends WebsocketEvent {
    event: 'chunk';
    fileId: string;
    progress: number;
    proccessed: boolean;
}

export interface WebsocketCompleteEvent extends WebsocketEvent {
    event: 'complete';
    fileId: string;
}

export interface WebsocketErrorEvent extends WebsocketEvent {
    event: 'error';
    fileId: string;
}

export type WebsocketEventUnion = WebsocketInitEvent | WebsocketChunkEvent | WebsocketCompleteEvent | WebsocketErrorEvent;