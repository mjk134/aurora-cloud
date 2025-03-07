import { REST } from "../rest.js";
import { Attachment, BlobPart, Message, UploadChunkOptions, UploadChunksOptions } from "./types/index.js";
import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto';
import {DiscordResponse, WebsocketChunkEvent, WebsocketCompleteEvent, WebsocketInitEvent} from '@repo/types'
import EventEmitter from "node:events";

export class Client {
    private _token: string;

    private rest : REST
    private DEFAULT_CHANNEL = '949673655250599959'

    constructor(token :string) {
        this._token = token;
        // Create a new REST client
        this.rest = new REST({
            baseUrl: 'https://discord.com/api/v10',
            headers: {
                'Authorization': `Bot ${this.token}`,
                'User-Agent': 'DiscordBot (https://github.com/mjk134/aurora-cloud, 0.0.1'
            }
        });
    }

    // Token getter
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
        const msg = await res.json() as Record<string, any>;
        const attachment = {
            ...msg.attachments[0],
            message_id: msg.id
        }
        return attachment as Attachment;
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
        const msg = await res.json() as Record<string, any>;
        return msg.attachments as Attachment[];
    }

    private chunkFile(file: Buffer): Buffer[] {
        const chunkSize = 10 * 1024 * 1024;
        const maxChunks = Math.ceil(file.length / chunkSize);
        const chunks = [];
        for (let i = 0; i < maxChunks; i++) {
            const start = i * chunkSize;
            const end = (i + 1) * chunkSize;
            chunks.push(file.slice(start, end));
        }
        return chunks;
    }


    /**
     * Should only be used for testing purposes. This function uploads a file to discord.
     */
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
            const attachment = await this.uploadChunk({ channelId, chunkId: randomUUID(), fileId, chunkData: chunk as unknown as BlobPart });
            attachments.push(attachment);
        }
        return {
            content: 'file uploaded',
            'files[0]': fileId,
            payload_json: JSON.stringify({ content: fileId }),
            attachments: attachments.map(a => ({
                url: a.url,
                id: a.message_id,
            }))
        }
    }

    /**
     * Main upload function. Recieves a file buffer from client and uploads it to discord.
     */
    public async uploadBufferFile({ channelId, fileBuffer, eventEmitter, userId }: { channelId?: string, fileBuffer: Buffer, eventEmitter: EventEmitter, userId: string }): Promise<[string, DiscordResponse]> {
        const fileId = randomUUID();
        const chunks = this.chunkFile(fileBuffer);
        // Initalisation complete
        eventEmitter.emit('message', JSON.stringify({ event: 'init', fileId, chunks: chunks.length, user_id: userId } as WebsocketInitEvent));
        const attachments: Attachment[] = [];
        // Loop over chunks
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (!chunk) {
                console.log('Failed to read chunk', i, chunk);
                eventEmitter.emit('message', JSON.stringify({ event: 'chunk', fileId, chunk: i, proccessed: false, user_id: userId } as WebsocketChunkEvent));
                continue;
            }
            const attachment = await this.uploadChunk({ channelId: channelId ?? this.DEFAULT_CHANNEL, chunkId: randomUUID(), fileId, chunkData: chunk as unknown as BlobPart });
            attachments.push(attachment);
            eventEmitter.emit('message', JSON.stringify({ event: 'chunk', fileId, chunk: i, proccessed: true, user_id: userId } as WebsocketChunkEvent));
        }
        eventEmitter.emit('message', JSON.stringify({ event: 'complete', fileId, user_id: userId } as WebsocketCompleteEvent));
        return [fileId, {
            chunks: attachments.map(a => {
                return {
                    url: a.url,
                    message_id: a.message_id,
                }
            })
        }]
    }

    private chunkFileAsText(file: Buffer): Buffer[] {
        // Max chunk size is 2000 UTF-16 characters
        console.log('file.length', file.length);
        // 1999 * 2 = 3998 (UTF-16 characters) + 1 for the backslash
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

    private async uploadChunkAsText({ channelId, chunkId, fileId, chunkData }: UploadChunkOptions): Promise<Record<string, any>> {
        const blob = new Blob([chunkData])
        const decoder = new TextDecoder('UTF-16')
        const d = decoder.decode(await blob.arrayBuffer())
        const data = {
            content: `\\${d}`,
        }

        const res = await this.rest.post(
            `/channels/${channelId}/messages`,
            { body: JSON.stringify(data) },
            true
        )

        const msg = await res.json() as Record<string, any>;

        return msg;
    }


    public async uploadAsText({ channelId, filePath }: { channelId: string, filePath: string }): Promise<{}> {
        const file = await fs.readFile(filePath);
        const fileId = randomUUID();
        const chunks = this.chunkFileAsText(file);
        const contents: {}[] = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (!chunk) {
                console.log('Failed to read chunk', i, chunk);
                continue;
            }
            const content = await this.uploadChunkAsText({ channelId, chunkId: randomUUID(), fileId, chunkData: chunk as unknown as BlobPart });
            contents.push(content);
        }
        return {}
    }

    public async downloadFile({ chunks }: { chunks: { message_id: string; channel_id: string; }[]; }): Promise<Buffer> {
        const bufArr = [];
        const messages = await Promise.all(
            chunks.map(c => this.getAttachmentUrl(c))
        )
        // Loop over chunk urls
        for (const url of messages) {
            // Extract message id and fetch if no url content available (only do once, if fail do it for the rest)
            const res = await fetch(url);
            const buf = await res.arrayBuffer();
            // Fetch returns array buffer so we have to convert to a normal buffer (just changing classes, might cause perf issues)
            bufArr.push(Buffer.from(buf))
        }
        // Concat to get the final buffer for the file
        return Buffer.concat(bufArr as any); // TODO: Fix type issue
    }

    private async getAttachmentUrl(chunk: {
        message_id: string;
        channel_id: string;
    }): Promise<string> {
        const msg_id = chunk.message_id;
        const channel_id = chunk.channel_id;
        const msg = await this.rest.get(
            `/channels/${channel_id}/messages/${msg_id}`
            )
        const d = await msg.json()
        return (d as Record<string, any>).attachments[0].url as string;
    }
}
