interface WebhookUploadAction {}

export interface DiscordWebhookUploadAction extends WebhookUploadAction {
    type: 'dc';

    chunks: {
        url: string;
        message_id: string;
    }[];
    encrypted: {
        iv: Buffer;
        key: Buffer;
        authTag: Buffer;
    }
}

export interface TelegramWebhookUploadAction extends WebhookUploadAction {
    type: 'tg';

    chunks: {
        file_id: string;
    }[];
    encrypted: {
        iv: Buffer;
        key: Buffer;
        authTag: Buffer;
    }
}

export type WebhookUploadActionUnion = DiscordWebhookUploadAction | TelegramWebhookUploadAction;