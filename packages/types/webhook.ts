interface WebhookAction {}

export class WebhookActionUpload implements WebhookAction {
    public type: 'upload' = 'upload';
}