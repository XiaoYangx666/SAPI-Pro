import {
    ItemUseAfterEvent,
    Player,
    ScriptEventCommandMessageAfterEvent,
    system,
    world,
} from "@minecraft/server";
import { LibErrorMes } from "./func";
import { RandomUtils } from "./utils/random";

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
    private secEventList: ((
        /**上次调度的时间(ms) */ lastsec: number,
        /**本次调度的时间(ms) */ cursec: number
    ) => void)[];
    private minEventList: (() => void)[];
    private tickEvents: (() => void)[];
    private lasttime: number;
    private lastsec: number;
    constructor() {
        this.secEventList = [];
        this.minEventList = [];
        this.tickEvents = [];
        this.lasttime = Date.now() - RandomUtils.int(60000);
        this.lastsec = Date.now() - RandomUtils.int(1000);
        world.afterEvents.worldLoad.subscribe(() => {
            system.runInterval(this.interval.bind(this));
        });
    }

    private interval() {
        const now = Date.now();
        if (now - this.lasttime >= 60000) {
            this.publishmin();
            this.lasttime = now;
        }
        if (now - this.lastsec >= 1000) {
            this.publishsec(this.lastsec, now);
            this.lastsec = now;
        }
        this.publishtick();
    }
    subscribetick(callback: () => void) {
        this.tickEvents.push(callback);
    }
    subscribesec(callback: (lastsec: number, cursec: number) => void) {
        this.secEventList.push(callback);
    }
    subscribemin(callback: () => void) {
        this.minEventList.push(callback);
    }
    private publishsec(lastsec: number, now: number) {
        for (let callback of this.secEventList) {
            try {
                callback(lastsec, now);
            } catch (e) {
                LibErrorMes("secIntervalError(" + e + ")at" + callback.toString().slice(40), e);
            }
        }
    }
    private publishmin() {
        for (let callback of this.minEventList) {
            try {
                callback();
            } catch (e) {
                LibErrorMes("MinintervalError(" + e + ")at" + callback.toString().slice(40), e);
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
export const itemBus = new itemBase();
export const ScriptEventBus = new ScriptEventBusClass();
