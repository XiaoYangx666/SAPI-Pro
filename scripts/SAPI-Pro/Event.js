import { system, world } from "@minecraft/server";
/**
 * 聊天订阅
 */
export class chatBusClass {
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
    subscribe(callback, priority = 0) {
        this.eventList.push({ callback: callback, priority: priority });
        this.eventList.sort((a, b) => b.priority - a.priority);
    }
    /**
     * 发布聊天事件
     * @param {ChatSendBeforeEvent} t 聊天事件
     */
    publish(t) {
        let Ope = undefined;
        if (this.eventList) {
            for (let event of this.eventList) {
                Ope = event.callback(t);
                if (Ope != undefined)
                    break;
            }
        }
        if (Ope === chatOpe.cancel)
            return true;
        if (Ope === chatOpe.skipsend)
            return false;
        return this.send(t);
    }
    /**
     * 设置聊天处理函数(唯一)
     *
     * 当聊天没有被任一函数取消时，将会调用此函数发送聊天
     *
     * 返回值:是否取消原版聊天发送
     */
    regsend(callback) {
        this.send = callback;
    }
}
export var chatOpe;
(function (chatOpe) {
    /**捕获消息取消发送 */
    chatOpe[chatOpe["cancel"] = 0] = "cancel";
    /**捕获消息并原版发送 */
    chatOpe[chatOpe["skipsend"] = 1] = "skipsend";
})(chatOpe || (chatOpe = {}));
/**
 * 订阅周期事件
 */
export class intervalBusClass {
    constructor() {
        this.secEventList = [];
        this.minEventList = [];
        this.tickEvents = [];
        this.lasttime = Date.now();
        this.lastsec = Date.now();
        system.runInterval(this.interval.bind(this));
    }
    interval() {
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
    subscribetick(callback) {
        this.tickEvents.push(callback);
    }
    subscribesec(callback) {
        this.secEventList.push(callback);
    }
    subscribemin(callback) {
        this.minEventList.push(callback);
    }
    publishsec(lastsec) {
        for (let callback of this.secEventList) {
            callback(lastsec);
        }
    }
    publishmin() {
        for (let callback of this.minEventList) {
            callback();
        }
    }
    publishtick() {
        for (let callback of this.tickEvents) {
            callback();
        }
    }
}
/**
 * 物品使用订阅
 */
export class itemBase {
    constructor() {
        this.itemMap = new Map();
        world.afterEvents.itemUse.subscribe((t) => itemBus.push(t));
    }
    /**
     * 用来绑定物品使用事件
     * @param {string} itemid 物品id
     * @param {Function} func 绑定函数，函数参数player
     */
    bind(itemid, func) {
        this.itemMap.set(itemid, func);
    }
    push(t) {
        let itemid = t.itemStack.typeId;
        let player = t.source;
        if (!this.itemMap.has(itemid))
            return;
        let func = this.itemMap.get(itemid);
        if (func) {
            func(player);
        }
    }
}
/**ScriptEvent订阅 */
export class ScriptEventBusClass {
    constructor() {
        this.record = new Map();
        system.afterEvents.scriptEventReceive.subscribe((t) => {
            this.publish(t);
        });
    }
    /**注册scriptEvent */
    bind(id, func) {
        ScriptEventBus.record.set(id, func);
    }
    publish(t) {
        const func = ScriptEventBus.record.get(t.id);
        if (func)
            func(t);
    }
}
export const intervalBus = new intervalBusClass();
export const chatBus = new chatBusClass();
export const itemBus = new itemBase();
export const ScriptEventBus = new ScriptEventBusClass();
