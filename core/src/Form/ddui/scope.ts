import { system } from "@minecraft/server";
import { LibLogger } from "../../utils/logger";

/** 订阅返回的清理句柄（函数 / 带 dispose / 带 unsubscribe），允许为空表示无法退订 */
export type UnsubscribeLike =
    | ((...args: any[]) => void)
    | { dispose(): void }
    | { unsubscribe(): void }
    | void;

/** 原生 Observable 的最小结构，方便测试替身与外部只读状态接入 */
export interface ObservableLike<T> {
    getData(): T;
    setData(value: T): void;
    subscribe(callback: (value: T) => void): (value: T) => void;
    unsubscribe(callback: (value: T) => void): boolean;
}

/** 可订阅源：原生 Observable 或事件信号（Signal / world 事件） */
export type SubscribableSource<T> = {
    subscribe(callback: (value: T) => void): UnsubscribeLike;
    getData?: () => T;
    unsubscribe?: (callback: (value: T) => void) => unknown;
};

/** 把任意形式的退订句柄归一成函数 */
export function toCleanup(handle: UnsubscribeLike): (() => void) | undefined {
    if (!handle) return;
    if (typeof handle === "function") return handle as () => void;
    const obj = handle as { dispose?: () => void; unsubscribe?: () => void };
    if (typeof obj.dispose === "function") return () => obj.dispose!();
    if (typeof obj.unsubscribe === "function") return () => obj.unsubscribe!();
    return;
}

function safeRun(run: () => void, label: string) {
    try {
        run();
    } catch (e) {
        // 单个清理失败不能中断其余清理，也不能让表单关闭流程抛错
        LibLogger.warn(`DDUI 清理失败: ${label}`, e);
    }
}

/**
 * 页面级资源容器。
 *
 * 页面关闭时按登记顺序倒序释放，每项都单独 try/catch，重复释放安全。
 * 业务代码只需要 `ui.onChange` / `ui.subscribe` / `ui.timeout`，不需要自己维护 cleanups 数组。
 */
export class DDScope {
    private items: Array<{ label: string; run: () => void }> = [];
    private closed = false;

    get isClosed() {
        return this.closed;
    }

    /** 托管一个清理函数；已关闭时立即执行（迟到的资源不会泄漏） */
    own(cleanup: () => void, label = "cleanup"): () => void {
        if (this.closed) {
            safeRun(cleanup, label);
            return () => {};
        }
        const item = { label, run: cleanup };
        this.items.push(item);
        return () => {
            const index = this.items.indexOf(item);
            if (index < 0) return;
            this.items.splice(index, 1);
            safeRun(item.run, item.label);
        };
    }

    /** 订阅原生 Observable；页面关闭或回调迟到时自动忽略 */
    track<T>(observable: ObservableLike<T>, callback: (value: T) => void, label = "observable"): () => void {
        if (this.closed) return () => {};
        const handle = observable.subscribe((value) => {
            if (this.closed) return;
            safeRun(() => callback(value), label);
        });
        return this.own(() => {
            observable.unsubscribe(handle);
        }, label);
    }

    /**
     * 订阅外部源（原生 Observable 或事件信号）。
     *
     * 原生 Observable 的 `subscribe` 返回的是**回调本身**（不是退订函数），
     * 用 `unsubscribe(回调)` 退订；事件信号返回的才是退订函数。
     * 两者在这里统一，页面关闭时都能真正解除订阅。
     */
    subscribe<T>(source: SubscribableSource<T>, listener: (value: T) => void, label = "signal"): () => void {
        if (this.closed) return () => {};
        const wrapped = (value: T) => {
            if (this.closed) return;
            safeRun(() => listener(value), label);
        };
        const handle = source.subscribe(wrapped);
        if (typeof source.unsubscribe === "function") {
            // 原生 Observable 和 Minecraft 事件信号均返回订阅回调，
            // 不能把它当作清理函数执行；统一使用 unsubscribe(回调)。
            const unsubscribe = source.unsubscribe.bind(source);
            return this.own(() => {
                unsubscribe(wrapped);
            }, label);
        }
        const cleanup = toCleanup(handle);
        return cleanup ? this.own(cleanup, label) : () => {};
    }

    /** 托管一个定时任务；页面关闭后自动取消，也不会在关闭后再执行 */
    timeout(callback: () => void, ticks = 1, label = "timeout"): () => void {
        if (this.closed) return () => {};
        let done = false;
        let release: () => void = () => {};
        const id = system.runTimeout(() => {
            if (done) return;
            done = true;
            // 定时任务已经完成，立即移除清理登记，避免长时间打开的
            // 页面不断累积已执行 timeout 的闭包和回调引用。
            release();
            if (this.closed) return;
            safeRun(callback, label);
        }, ticks);
        release = this.own(() => {
            if (done) return;
            done = true;
            system.clearRun(id);
        }, label);
        return release;
    }

    /** 托管一个循环任务；页面关闭后自动取消 */
    interval(callback: () => void, ticks = 1, label = "interval"): () => void {
        if (this.closed) return () => {};
        const id = system.runInterval(() => {
            if (this.closed) return;
            safeRun(callback, label);
        }, ticks);
        return this.own(() => system.clearRun(id), label);
    }

    /** 释放全部资源；幂等且不抛错 */
    dispose() {
        if (this.closed) return;
        this.closed = true;
        const items = this.items.splice(0);
        for (let i = items.length - 1; i >= 0; i--) {
            safeRun(items[i].run, items[i].label);
        }
    }
}
