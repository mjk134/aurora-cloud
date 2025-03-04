import { randomUUID } from "node:crypto";
import { REST } from "../rest";
import { EventEmitter } from "node:stream";

export class TelegramClient {
    private _token: string;
    private rest: REST;
    private DEFAULT_CHAT_ID: string = '6361636845';


    constructor(token :string) {
        this._token = token;
        this.rest = new REST({
            baseUrl: `https://api.telegram.org/bot${this._token}`
        })
    }

    private chunkFile(file: Buffer): Buffer[] {
        const chunkSize = 20 * 1024 * 1024; // 50 MB limit but 20 MB for bots
        const maxChunks = Math.ceil(file.length / chunkSize);
        const chunks = [];
        for (let i = 0; i < maxChunks; i++) {
            const start = i * chunkSize;
            const end = (i + 1) * chunkSize;
            chunks.push(file.slice(start, end));
        }
        return chunks;
    }

    public async uploadChunk({ chatId, chunkId, fileId, chunkData }: { chatId?: string, chunkId: string, fileId: string, chunkData: Buffer }): Promise<[string, any]> {
        const data = new FormData()
        data.append('chat_id', chatId ?? this.DEFAULT_CHAT_ID)
        data.append('document', new Blob([chunkData], { type: 'text/plain' }), chunkId);
        const res = await this.rest.post(
            `/sendDocument`,
            { body: data }
        )
        const msg = await res.json() as Record<string, any>;
        console.log(JSON.stringify(msg))
        return ['', null]
    }

    public async uploadBufferFile({ chatId, fileBuffer, eventEmitter }: { chatId?: string, fileBuffer: Buffer, eventEmitter: EventEmitter }): Promise<[string, any]> {
        const fileId = randomUUID();
        const chunks = this.chunkFile(fileBuffer);
        const messages = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (!chunk) {
                console.log('Failed to read chunk', i, chunk);
                continue;
            }
            const document = await this.uploadChunk({ chatId: chatId ?? this.DEFAULT_CHAT_ID, chunkId: randomUUID(), fileId, chunkData: chunk });
            messages.push(document);
        }
        return [fileId, null]
    }

    public async sendMessage({ chatId = this.DEFAULT_CHAT_ID, text }: { chatId?: string, text: string }): Promise<void> {
        const data = await this.rest.post(`/sendMessage`, {
            body: JSON.stringify({
                chat_id: chatId,
                text
            })
        }, true)
        console.log('Sent message:', await data.json())
    }

    public async getMe(): Promise<void> {
        const data = await this.rest.get(`/getMe`)
        console.log('Bot info:', await data.json())
    }

    public async getUpdates(): Promise<void> {
        const data = await this.rest.get(`/getUpdates`)
        console.table((await data.json() as any).result[0].message)
    }
}