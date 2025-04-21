export interface DiscordResponse {
    chunks: {
        url: string;
        message_id: string;
    }[]
}