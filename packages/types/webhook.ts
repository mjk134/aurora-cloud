interface WebhookUploadAction {
    encrypted: {
        iv: ReturnType<typeof Buffer.prototype.toJSON>;
        key: ReturnType<typeof Buffer.prototype.toJSON>;
        authTag: ReturnType<typeof Buffer.prototype.toJSON>;
    }
}

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
        file_id: string;
    }[];
}

export type WebhookUploadActionUnion = DiscordWebhookUploadAction | TelegramWebhookUploadAction;