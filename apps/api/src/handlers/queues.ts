export default class QueueHandler {
    private masterQueue: QueueItem[] = [] // fifo

    public async startLoop() {
        while (true) {
            if (!this.masterQueue[0]){
                await new Promise((res, rej) => {
                    return setTimeout(res , 500)
                })
                continue
            }
            await this.masterQueue[0].promise();
            this.masterQueue = this.masterQueue.slice(0);
        }
    }

    public addItem(item: QueueItem) {
        // TODO: Check priority of last item, otherwise shift it forward
        this.masterQueue.push(item);
    }
}

type QueueItemType = 'dc' | 'tg' | 'tt' | 'yt' // discord, telegram, tiktok, youtube

type QueueItem = {
    type: QueueItemType;
    promise: () => Promise<void>;
    weight: number;
};