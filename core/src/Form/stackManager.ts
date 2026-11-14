import { Player } from "@minecraft/server";
import { SAPIProFormContext } from "./form";
import { contextArgs, FormLike } from "./interface";

export class PlayerFormStack {
    private stack: SAPIProFormContext<any, any>[] = [];
    /**
     * 导航代际：每次真正调度一次展示就自增。
     * 异步 show / 延迟打开的旧任务在代际变化后自行放弃，不会覆盖新的页面。
     */
    navGeneration = 0;

    constructor(private readonly player: Player) {}

    /** @internal 标记一次新的展示调度，返回本次调度的代际 */
    bumpGeneration() {
        return ++this.navGeneration;
    }

    push(args: contextArgs, form?: FormLike<any>) {
        const context = new SAPIProFormContext(args, this, form);
        this.stack.push(context);
        return context;
    }
    pop() {
        return this.stack.pop();
    }
    getTop() {
        if (this.stack.length == 0) return;
        return this.stack[this.stack.length - 1];
    }
    /** 栈深度（DDUI 页面可用来判断是否还有上一页） */
    get depth() {
        return this.stack.length;
    }
    clear() {
        this.stack = [];
    }
    getPlayer() {
        return this.player;
    }
    isValid() {
        return this.player.isValid;
    }
}

class FormContextStackManager {
    private playerDataMap = new Map<string, PlayerFormStack>();
    getStack(player: Player) {
        return this.playerDataMap.get(player.id);
    }
    resetStack(player: Player) {
        const playerStack = new PlayerFormStack(player);
        this.playerDataMap.set(player.id, playerStack);
        return playerStack;
    }
    /**获取top元素 */
    getTop(player: Player) {
        const stack = this.getStack(player);
        if (!stack?.isValid()) return;
        return stack.getTop();
    }
    /**清理掉线 */
    clearOff() {
        for (let [id, stack] of this.playerDataMap.entries()) {
            if (!stack.isValid()) {
                this.playerDataMap.delete(id);
            }
        }
    }
}

export const formStackManager = new FormContextStackManager();
