import { REST } from "./rest";
import { Attachment, Message, UploadChunkOptions, UploadChunksOptions } from "./types";
import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto';

export class Client {
    private _token: string;
    private rest : REST

    constructor(token :string) {
        this._token = token;
        this.rest = new REST(this);
    }

    get token() {
        return this._token;
    }

    private async uploadChunk({ channelId, chunkId, fileId, chunkData }: UploadChunkOptions): Promise<Attachment> {
        const data = new FormData()
        data.append('payload_json', JSON.stringify({ content: fileId }))
        data.append(`files[0]`, new Blob([chunkData], { type: 'text/plain' }), chunkId);
        const res = await this.rest.post(
            `/channels/${channelId}/messages`,
            { body: data }
        )
        const msg = await res.json();
        return msg.attachments[0] as Attachment;
    }

    public async uploadChunks({ channelId, chunkIds, fileId, chunkData }: UploadChunksOptions): Promise<Attachment[]> {
        const data = new FormData()
        data.append('payload_json', JSON.stringify({ content: fileId }))
        for (let i = 0; i < chunkIds.length; i++) {
            const chunkId = chunkIds[i];
            const chunk = chunkData[i];
            if (!chunk) {
                console.log('Failed to read chunk', i, chunk);
                continue;
            }
            data.append(`files[${i}]`, new Blob([chunk], { type: 'text/plain' }), chunkId);
        }
        const res = await this.rest.post(
            `/channels/${channelId}/messages`,
            { body: data }
        )
        const msg = await res.json();
        return msg.attachments as Attachment[];
    }

    private chunkFile(file: Buffer): Buffer[] {
        const chunkSize = 25 * 1024 * 1024;
        const maxChunks = Math.ceil(file.length / chunkSize);
        const chunks = [];
        for (let i = 0; i < maxChunks; i++) {
            const start = i * chunkSize;
            const end = (i + 1) * chunkSize;
            chunks.push(file.slice(start, end));
        }
        return chunks;
    }

    public async upload({ channelId, filePath }: { channelId: string, filePath: string }): Promise<Message> {
        const file = await fs.readFile(filePath);
        const fileId = randomUUID();
        const chunks = this.chunkFile(file);
        const attachments: Attachment[] = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (!chunk) {
                console.log('Failed to read chunk', i, chunk);
                continue;
            }
            const attachment = await this.uploadChunk({ channelId, chunkId: randomUUID(), fileId, chunkData: chunk });
            attachments.push(attachment);
        }
        return {
            content: 'file uploaded',
            'files[0]': fileId,
            payload_json: JSON.stringify({ content: fileId }),
            attachments: attachments.map(a => a.url)
        }
    }

    private chunkFileAsText(file: Buffer): Buffer[] {
        // Max chunk size is 2000 UTF-16 characters
        console.log('file.length', file.length);
        const chunkSize = 1999 * 2 ;
        const maxChunks = Math.ceil(file.length / chunkSize);
        console.log('maxChunks', maxChunks)
        const chunks = [];
        for (let i = 0; i < maxChunks; i++) {
            const start = i * chunkSize;
            const end = (i + 1) * chunkSize;
            chunks.push(file.slice(start, end));
        }
        console.log('chunks', chunks.length)
        return chunks;
    }

    private async uploadChunkAsText({ channelId, chunkId, fileId, chunkData }: UploadChunkOptions): Promise<{}> {
        const blob = new Blob([chunkData])
        const decoder = new TextDecoder('UTF-16')
        const d = decoder.decode(await blob.arrayBuffer())
        console.log('d', d.length)
        const data = {
            content: `\\${d}`,
        }

        const res = await this.rest.post(
            `/channels/${channelId}/messages`,
            { body: JSON.stringify(data) },
            true
        )
        console.log(res.headers.get('X-RateLimit-Remaining'))

        const msg = await res.json();

        return msg;
    }


    public async uploadAsText({ channelId, filePath }: { channelId: string, filePath: string }): Promise<{}> {
        const file = await fs.readFile(filePath);
        const fileId = randomUUID();
        const chunks = this.chunkFileAsText(file);
        const contents: Message[] = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (!chunk) {
                console.log('Failed to read chunk', i, chunk);
                continue;
            }
            const content = await this.uploadChunkAsText({ channelId, chunkId: randomUUID(), fileId, chunkData: chunk });
        }
        return {}
    }
}