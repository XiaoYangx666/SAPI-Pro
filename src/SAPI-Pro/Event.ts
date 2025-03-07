import { ChatSendBeforeEvent, ItemUseAfterEvent, Player, ScriptEventCommandMessageAfterEvent, system, world } from "@minecraft/server";
import { LibError, LibMessage } from "./func";

//先不搞优先队列了，能用就行，反正只有注册的时候排序
export type chatFunc = (t: ChatSendBeforeEvent) => void | chatOpe;
export interface chatEvents {
    priority: number;
    callback: (t: ChatSendBeforeEvent) => void | chatOpe;
}
/**
 * 聊天订阅
 */
export class chatBusClass {
    private eventList: chatEvents[];
    private send: (t: ChatSendBeforeEvent) => boolean;
    constructor() {
        this.eventList = [];
        this.send = (t) => {
            return false;
        };
        world.beforeEvents.chatSend.subscribe((t) => {
            t.cancel = chatBus.publish(t);
        });
    }
    /**
     * 订阅聊天事件
     *
     * 返回值:是否取消原版聊天发送
     */
    subscribe(callback: chatFunc, priority: number = 0) {
        this.eventList.push({ callback: callback, priority: priority });
        this.eventList.sort((a, b) => b.priority - a.priority);
    }
    /**
     * 发布聊天事件
     * @param {ChatSendBeforeEvent} t 聊天事件
     */
    private publish(t: ChatSendBeforeEvent) {
        let Ope = undefined;
        if (this.eventList) {
            for (let event of this.eventList) {
                Ope = event.callback(t);
                if (Ope != undefined) break;
            }
        }
        if (Ope === chatOpe.cancel) return true;
        if (Ope === chatOpe.skipsend) return false;
        return this.send(t);
    }
    /**
     * 设置聊天处理函数(唯一)
     *
     * 当聊天没有被任一函数取消时，将会调用此函数发送聊天
     *
     * 返回值:是否取消原版聊天发送
     */
    regsend(callback: (t: ChatSendBeforeEvent) => boolean) {
        this.send = callback;
    }
}

export enum chatOpe {
    /**捕获消息取消发送 */
    cancel,
    /**捕获消息并原版发送 */
    skipsend,
}
/**
 * 订阅周期事件
 */
export class intervalBusClass {
    private secEventList: ((lastsec: number) => void)[];
    private minEventList: (() => void)[];
    private tickEvents: (() => void)[];
    private lasttime: number;
    private lastsec: number;
    constructor() {
        this.secEventList = [];
        this.minEventList = [];
        this.tickEvents = [];
        this.lasttime = Date.now();
        this.lastsec = Date.now();
        system.runInterval(this.interval.bind(this));
    }
    private interval() {
        if (Date.now() - this.lasttime >= 60000) {
            this.publishmin();
            this.lasttime = Date.now();
        }
        if (Date.now() - this.lastsec >= 1000) {
            this.publishsec(this.lastsec);
            this.lastsec = Date.now();
        }
        this.publishtick();
    }
    subscribetick(callback: () => void) {
        this.tickEvents.push(callback);
    }
    subscribesec(callback: (lastsec: number) => void) {
        this.secEventList.push(callback);
    }
    subscribemin(callback: () => void) {
        this.minEventList.push(callback);
    }
    private publishsec(lastsec: number) {
        for (let callback of this.secEventList) {
            try {
                callback(lastsec);
            } catch (e) {
                LibError("secIntervalError(" + e + ")at" + callback.toString().slice(40));
            }
        }
    }
    private publishmin() {
        for (let callback of this.minEventList) {
            try {
                callback();
            } catch (e) {
                LibError("MinintervalError(" + e + ")at" + callback.toString().slice(40));
            }
        }
    }
    private publishtick() {
        for (let callback of this.tickEvents) {
            callback();
        }
    }
}

/**
 * 物品使用订阅
 */
export class itemBase {
    private itemMap: Map<string, (player: Player) => void>;
    constructor() {
        this.itemMap = new Map();
        world.afterEvents.itemUse.subscribe((t) => itemBus.push(t));
    }
    /**
     * 用来绑定物品使用事件
     * @param {string} itemid 物品id
     * @param {Function} func 绑定函数，函数参数player
     */
    bind(itemid: string, func: (player: Player) => void) {
        this.itemMap.set(itemid, func);
    }
    private push(t: ItemUseAfterEvent) {
        let itemid = t.itemStack.typeId;
        let player = t.source;
        if (!this.itemMap.has(itemid)) return;
        let func = this.itemMap.get(itemid);
        if (func) {
            func(player);
        }
    }
}

/**ScriptEvent订阅 */
export class ScriptEventBusClass {
    record = new Map();
    constructor() {
        system.afterEvents.scriptEventReceive.subscribe((t) => {
            this.publish(t);
        });
    }
    /**注册scriptEvent */
    bind(id: string, func: (t: ScriptEventCommandMessageAfterEvent) => void) {
        ScriptEventBus.record.set(id, func);
    }
    private publish(t: ScriptEventCommandMessageAfterEvent) {
        const func = ScriptEventBus.record.get(t.id);
        if (func) func(t);
    }
}

export const intervalBus = new intervalBusClass();
export const chatBus = new chatBusClass();
export const itemBus = new itemBase();
export const ScriptEventBus = new ScriptEventBusClass();
