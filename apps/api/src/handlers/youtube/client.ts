import { REST } from "../rest";

export class YoutubeClient {
    // @ts-ignore
    private rest: REST;

    constructor() {
        this.rest = new REST({
            baseUrl: `https://www.googleapis.com/youtube/v3`
        })
    }

    

}