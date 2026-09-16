import {
    ItemUseAfterEvent,
    Player,
    ScriptEventCommandMessageAfterEvent,
    system,
    world,
} from "@minecraft/server";
import { LibErrorMes } from "./func";
import { RandomUtils } from "./utils/main";

// 聊天相关类型与 chatBusClass（含 chatOpe / chatFunc / chatEvents / ChatSendBeforeEventLike）。
// chatBus 实例不在此导出——它是唯一的 beta-only 导出，由渠道入口（Event.entry.beta.ts）决定是否暴露
export * from "./Event/chatBusClass";

/**
 * 订阅周期事件
 *
 * 定时器按需启动：首个 tick/sec/min 订阅者到来时才 `runInterval`。
 * 没用过周期事件的包不会建立每 tick 调用（此前无论如何都会常驻 20Hz）。
 * 启动后不再停表——一旦用过就继续跑，不做退订/清理那套。
 * 启动仍延迟到 worldLoad 之后（回调会访问世界数据，如 formStackManager.clearOff）。
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
    /**runInterval 返回的 id；undefined 表示未启动 */
    private timer: number | undefined;
    private worldLoaded = false;
    /**worldLoad 之前就有人订阅，加载后需要补启动 */
    private startPending = false;
    constructor() {
        this.secEventList = [];
        this.minEventList = [];
        this.tickEvents = [];
        this.lasttime = Date.now() - RandomUtils.int(60000);
        this.lastsec = Date.now() - RandomUtils.int(1000);
        world.afterEvents.worldLoad.subscribe(() => {
            this.worldLoaded = true;
            if (this.startPending) this.startTimer();
        });
    }

    /**首个订阅者到来时启动定时器（worldLoad 之前订阅则等加载后再启动） */
    private ensureStarted() {
        if (this.timer !== undefined || this.startPending) return;
        if (this.worldLoaded) {
            this.startTimer();
        } else {
            this.startPending = true;
        }
    }

    private startTimer() {
        this.startPending = false;
        this.timer ??= system.runInterval(() => this.interval());
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
        this.ensureStarted();
    }
    subscribesec(callback: (lastsec: number, cursec: number) => void) {
        this.secEventList.push(callback);
        this.ensureStarted();
    }
    subscribemin(callback: () => void) {
        this.minEventList.push(callback);
        this.ensureStarted();
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
 *
 * itemUse 监听按需建立：首次 `bind` 物品时才订阅原版事件。
 */
export class itemBase {
    private itemMap: Map<string, (player: Player) => void>;
    private bound = false;
    constructor() {
        this.itemMap = new Map();
    }
    /**
     * 用来绑定物品使用事件
     * @param {string} itemid 物品id
     * @param {Function} func 绑定函数，函数参数player
     */
    bind(itemid: string, func: (player: Player) => void) {
        this.itemMap.set(itemid, func);
        if (this.bound) return;
        this.bound = true;
        world.afterEvents.itemUse.subscribe((t) => this.push(t));
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
