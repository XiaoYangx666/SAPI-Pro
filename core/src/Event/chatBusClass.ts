import { Player, world } from "@minecraft/server";

/**
 * 聊天发送前事件的轻量结构类型。
 *
 * `ChatSendBeforeEvent` 只存在于 beta 版 `@minecraft/server`，stable 版没有该事件，
 * 因此这里用结构类型代替，避免在 stable 渠道下 import 不存在的命名导出导致类型检查失败。
 */
export interface ChatSendBeforeEventLike {
    cancel: boolean;
    message: string;
    sender: Player;
}

//先不搞优先队列了，能用就行，反正只有注册的时候排序
export type chatFunc = (t: ChatSendBeforeEventLike) => void | chatOpe;
export interface chatEvents {
    priority: number;
    callback: (t: ChatSendBeforeEventLike) => void | chatOpe;
}
/**
 * 聊天订阅
 */
export class chatBusClass {
    private eventList: chatEvents[];
    private send: (t: ChatSendBeforeEventLike) => boolean;
    constructor() {
        this.eventList = [];
        this.send = (t) => {
            return false;
        };
        // 仅 beta 版 @minecraft/server 提供 beforeEvents.chatSend（stable 类型里不存在该属性，故断言），
        // 整段包在 __BETA__ 里，stable 构建连类定义都会死代码消除，产物里不含任何 chatSend 引用
        if (__BETA__) {
            const beforeEvents = world.beforeEvents as unknown as {
                chatSend: { subscribe(cb: (t: ChatSendBeforeEventLike) => void): void };
            };
            beforeEvents.chatSend.subscribe((t) => {
                t.cancel = this.publish(t);
            });
        }
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
    private publish(t: ChatSendBeforeEventLike) {
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
    regsend(callback: (t: ChatSendBeforeEventLike) => boolean) {
        this.send = callback;
    }
}

export enum chatOpe {
    /**捕获消息取消发送 */
    cancel,
    /**捕获消息并原版发送 */
    skipsend,
}
