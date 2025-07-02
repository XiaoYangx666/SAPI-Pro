import { Player } from "@minecraft/server";
import { SAPIProForm, SAPIProFormContext } from "./form";
import { contextArgs, formDataType } from "./interface";

export class PlayerFormStack {
    private stack: SAPIProFormContext<formDataType>[] = [];
    constructor(private readonly player: Player) {}

    push(args: contextArgs, form?: SAPIProForm<formDataType>) {
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
    push(player: Player, args: contextArgs) {
        let stack = this.getStack(player) ?? this.resetStack(player);
        stack.push(args);
    }
    pop(player: Player) {
        const stack = this.getStack(player);
        return stack?.pop();
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
