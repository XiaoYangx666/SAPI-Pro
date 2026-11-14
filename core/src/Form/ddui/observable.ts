import { ObservableBoolean, ObservableNumber, ObservableString } from "@minecraft/server-ui";
import type { DDScope, ObservableLike } from "./scope";

export type ObservableValue = string | number | boolean;

/** 根据初始值类型创建对应的原生 Observable */
export function createObservable<T extends ObservableValue>(initial: T): ObservableLike<T> {
    if (typeof initial === "boolean") {
        return new ObservableBoolean(initial) as unknown as ObservableLike<T>;
    }
    if (typeof initial === "number") {
        return new ObservableNumber(initial) as unknown as ObservableLike<T>;
    }
    return new ObservableString(String(initial)) as unknown as ObservableLike<T>;
}

/** 值类型 → 原生 Observable 类型，用于 computed 的返回类型推导 */
export type ObservableOf<T> = T extends boolean
    ? ObservableBoolean
    : T extends number
      ? ObservableNumber
      : ObservableString;

/**
 * 由若干原生 Observable 派生的只读 Observable。
 *
 * 依赖变化时同步重算，值没变就不写回（避免无意义的客户端同步）。
 * 订阅随页面释放，不需要调用方管理。
 */
export function computedObservable<T extends ObservableValue>(
    scope: DDScope,
    deps: readonly ObservableLike<any>[],
    compute: () => T
): ObservableOf<T> {
    const initial = compute();
    const out = createObservable(initial);
    let updating = false;
    const update = () => {
        if (updating || scope.isClosed) return;
        updating = true;
        try {
            const next = compute();
            if (next !== out.getData()) out.setData(next);
        } finally {
            updating = false;
        }
    };
    for (const dep of deps) scope.track(dep, update, "computed");
    return out as unknown as ObservableOf<T>;
}

/**
 * 程序写入守卫。
 *
 * 原生 Observable 只在值真正变化时同步通知订阅者（官方语义），因此不存在
 * “同一个值、来源不同”的歧义：唯一需要处理的是**本次 `setData` 自身触发的回调**。
 * 这里在写入期间打一个同步标记，`ui.onChange` 看到标记就跳过。
 *
 * 不记录“最后写入值”，也不做时间窗口猜测：客户端后续回报的值如果与当前值相同，
 * 原生层根本不会通知；如果不同，那就是一次真实的输入。
 */
export class WriteGuard {
    private writing = new WeakSet<object>();

    /** 程序写入：值没变时直接返回（不产生通知） */
    write<T>(observable: ObservableLike<T>, value: T) {
        if (Object.is(observable.getData(), value)) return;
        const key = observable as unknown as object;
        this.writing.add(key);
        try {
            observable.setData(value);
        } finally {
            this.writing.delete(key);
        }
    }

    /** 当前是否处于本次程序写入的同步通知中 */
    isOwnWrite(observable: ObservableLike<any>): boolean {
        return this.writing.has(observable as unknown as object);
    }
}
