// Types that need to be made
export interface DiscordResponse {
    // Don't need channel id since its fixed for now TODO: variable channel id
    chunks: {
        url: string;
        message_id: string;
    }[]
}