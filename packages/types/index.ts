import { DiscordResponse } from "./discord";

export * from "./discord";

// All possible storage types returned by API based on queue priority
type StorageType = "discord" | "telegram" | "youtube" | "x";
// Type abastraction for easy reading
type FileID = string;

// This is the response from the API when a file is uploaded
export interface UploadResponse {
    error?: boolean;
    message: string;
    type: StorageType;
    fileId: FileID;
    // Lazy but works, TODO: add specific types for each storage type
    discord?: DiscordResponse;
}