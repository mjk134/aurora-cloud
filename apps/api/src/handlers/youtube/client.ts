import { REST } from "../rest";

export class YoutubeClient {
    private rest: REST;

    constructor() {
        this.rest = new REST({
            baseUrl: `https://www.googleapis.com/youtube/v3`
        })
    }

    

}