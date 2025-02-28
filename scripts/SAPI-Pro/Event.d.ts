import { ChatSendBeforeEvent, Player, ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
export type chatFunc = (t: ChatSendBeforeEvent) => void | chatOpe;
export interface chatEvents {
    priority: number;
    callback: (t: ChatSendBeforeEvent) => void | chatOpe;
}
/**
 * 聊天订阅
 */
export declare class chatBusClass {
    private eventList;
    private send;
    constructor();
    /**
     * 订阅聊天事件
     *
     * 返回值:是否取消原版聊天发送
     */
    subscribe(callback: chatFunc, priority?: number): void;
    /**
     * 发布聊天事件
     * @param {ChatSendBeforeEvent} t 聊天事件
     */
    private publish;
    /**
     * 设置聊天处理函数(唯一)
     *
     * 当聊天没有被任一函数取消时，将会调用此函数发送聊天
     *
     * 返回值:是否取消原版聊天发送
     */
    regsend(callback: (t: ChatSendBeforeEvent) => boolean): void;
}
export declare enum chatOpe {
    /**捕获消息取消发送 */
    cancel = 0,
    /**捕获消息并原版发送 */
    skipsend = 1
}
/**
 * 订阅周期事件
 */
export declare class intervalBusClass {
    private secEventList;
    private minEventList;
    private tickEvents;
    private lasttime;
    private lastsec;
    constructor();
    private interval;
    subscribetick(callback: () => void): void;
    subscribesec(callback: (lastsec: number) => void): void;
    subscribemin(callback: () => void): void;
    private publishsec;
    private publishmin;
    private publishtick;
}
/**
 * 物品使用订阅
 */
export declare class itemBase {
    private itemMap;
    constructor();
    /**
     * 用来绑定物品使用事件
     * @param {string} itemid 物品id
     * @param {Function} func 绑定函数，函数参数player
     */
    bind(itemid: string, func: (player: Player) => void): void;
    private push;
}
/**ScriptEvent订阅 */
export declare class ScriptEventBusClass {
    record: Map<any, any>;
    constructor();
    /**注册scriptEvent */
    bind(id: string, func: (t: ScriptEventCommandMessageAfterEvent) => void): void;
    private publish;
}
export declare const intervalBus: intervalBusClass;
export declare const chatBus: chatBusClass;
export declare const itemBus: itemBase;
export declare const ScriptEventBus: ScriptEventBusClass;
