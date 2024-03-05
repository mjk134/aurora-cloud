import { Client } from "./client";

export class REST {
    private client: Client;
    private headers = new Headers();
    private baseUrl = 'https://discord.com/api/v10';

    constructor(client: Client) {
        this.client = client;
        this.headers.set('Authorization', `Bot ${this.client.token}`);
        this.headers.set('User-Agent', 'DiscordBot (https://github.com/mjk134/aurora-cloud, 0.0.1)')
    }

    private async request(method: string, urlLocation: string, options: RequestInit = {}, json?: boolean): Promise<Response> {
        options.headers = this.headers;
        if (json) options.headers.set('Content-Type', 'application/json');
        return fetch(`${this.baseUrl}${urlLocation}`, { method, ...options });
    }

    async get(url: string, options: RequestInit = {}): Promise<Response> {
        return this.request('GET', url, options);
    }

    async post(url: string, options: RequestInit = {}, json: boolean = false): Promise<Response> {
        return this.request('POST', url, options, json);
    }

    async put(url: string, options: RequestInit = {}): Promise<Response> {
        return this.request('PUT', url, options);
    }

    async patch(url: string, options: RequestInit = {}): Promise<Response> {
        return this.request('PATCH', url, options);
    }

    async delete(url: string, options: RequestInit = {}): Promise<Response> {
        return this.request('DELETE', url, options);
    }
}