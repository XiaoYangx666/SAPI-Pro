import { world } from "@minecraft/server";

type Binder = () => void | Promise<void>;

class DeferredRegistry {
    private binders: Binder[] = [];
    private bound = false;

    constructor() {
        world.afterEvents.worldLoad.subscribe((t) => {
            this.bindAll();
        });
    }

    register(binder: Binder) {
        this.binders.push(binder);
    }

    /** 统一绑定 */
    async bindAll() {
        if (this.bound) return; // 防止重复绑定
        this.bound = true;

        for (const binder of this.binders) {
            await binder();
        }

        this.binders.length = 0; // 可选：释放引用
    }

    /** 状态查询 */
    isBound() {
        return this.bound;
    }
}

export const gameDeferredRegistry = new DeferredRegistry();
