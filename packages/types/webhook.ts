interface WebhookUploadAction {}

export interface DiscordWebhookUploadAction extends WebhookUploadAction {
    type: 'dc';

    chunks: {
        url: string;
        message_id: string;
    }[];
}

export interface TelegramWebhookUploadAction extends WebhookUploadAction {
    type: 'tg';

    chunks: {
        url: string;
        msg_id: string;
    }[];
}

export type WebhookUploadActionUnion = DiscordWebhookUploadAction | TelegramWebhookUploadAction;