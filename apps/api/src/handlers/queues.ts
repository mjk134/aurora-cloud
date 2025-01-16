import EventEmitter from "node:events";

export default class QueueHandler extends EventEmitter {
    private masterQueue: QueueItem[] = [] // fifo


    public addItem(item: QueueItem) {
        // TODO: Check priority of last item, otherwise shift it forward
        this.masterQueue.push(item);
    }
}

type QueueItemType = 'dc' | 'tg' | 'tt' | 'yt' // discord, telegram, tiktok, youtube

type QueueItem = {
    type: QueueItemType;
    weight: number;
};