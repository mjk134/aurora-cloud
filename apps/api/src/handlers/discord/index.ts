import { Handler } from "../types";

// TODO: Implement Handler interface for Discord
export default class DiscordHandler implements Handler  {
    downloadFile(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    uploadFile(data: Buffer): Promise<Record<string, any>> {
        throw new Error("Method not implemented.");
    }
    getAverageWaitTime(): number {
        throw new Error("Method not implemented.");
    }
    getStatus(): Promise<"working" | "unavailable" | "error"> {
        throw new Error("Method not implemented.");
    }


}