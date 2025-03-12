export class REST {
  private headers: Headers;
  private baseUrl: string;

  constructor({
    baseUrl,
    headers,
  }: {
    baseUrl: string;
    headers?: Record<string, string>;
  }) {
    this.baseUrl = baseUrl;
    this.headers = new Headers(headers);
  }

  public addHeader(key: string, value: string) {
    this.headers.set(key, value);
  }

  private async request(
    method: string,
    urlLocation: string,
    options: RequestInit = {},
    json?: boolean,
  ): Promise<Response> {
    options.headers = this.headers;
    if (json) options.headers.set("Content-Type", "application/json");
    return fetch(`${this.baseUrl}${urlLocation}`, { method, ...options });
  }

  async get(url: string, options: RequestInit = {}): Promise<Response> {
    return this.request("GET", url, options);
  }

  async post(
    url: string,
    options: RequestInit = {},
    json: boolean = false,
  ): Promise<Response> {
    return this.request("POST", url, options, json);
  }

  async put(url: string, options: RequestInit = {}): Promise<Response> {
    return this.request("PUT", url, options);
  }

  async patch(url: string, options: RequestInit = {}): Promise<Response> {
    return this.request("PATCH", url, options);
  }

  async delete(url: string, options: RequestInit = {}): Promise<Response> {
    return this.request("DELETE", url, options);
  }
}
