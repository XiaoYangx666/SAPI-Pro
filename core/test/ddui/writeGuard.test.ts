// =====================================================
// WriteGuard - 程序写入 / 客户端输入语义
// =====================================================
import { describe, expect, it, vi } from "vitest";

vi.mock("@minecraft/server-ui", () => ({
    ObservableBoolean: class {},
    ObservableNumber: class {},
    ObservableString: class {},
}));

import { WriteGuard } from "../../src/Form/ddui/observable";

/** 与原生 Observable 语义一致：同值不通知、通知同步派发 */
class FakeObservable<T> {
    private listeners = new Set<(value: T) => void>();
    constructor(private value: T) {}
    getData() {
        return this.value;
    }
    setData(value: T) {
        if (Object.is(value, this.value)) return;
        this.value = value;
        for (const listener of [...this.listeners]) listener(value);
    }
    subscribe(callback: (value: T) => void) {
        this.listeners.add(callback);
        return callback;
    }
    unsubscribe(callback: (value: T) => void) {
        return this.listeners.delete(callback);
    }
}

function setup<T>(initial: T) {
    const guard = new WriteGuard();
    const observable = new FakeObservable(initial);
    const events: Array<{ value: T; own: boolean }> = [];
    observable.subscribe((value) => events.push({ value, own: guard.isOwnWrite(observable) }));
    return { guard, observable, events };
}

describe("WriteGuard", () => {
    it("同步触发的回调用程序写入标记屏蔽", () => {
        const { guard, observable, events } = setup(0);
        guard.write(observable, 50);
        expect(events).toEqual([{ value: 50, own: true }]);
    });

    it("写入相同值不产生通知", () => {
        const { guard, observable, events } = setup(0);
        guard.write(observable, 0);
        expect(events).toEqual([]);
    });

    it("写入返回后，客户端输入不会被抑制", () => {
        const { guard, observable, events } = setup(0);
        guard.write(observable, 50);
        // 客户端通过原生通道写入（不经过 guard）
        observable.setData(51);
        expect(events).toEqual([
            { value: 50, own: true },
            { value: 51, own: false },
        ]);
    });

    it("连续程序写入的每一次自身通知都被屏蔽", () => {
        const { guard, observable, events } = setup(0);
        guard.write(observable, 10);
        guard.write(observable, 20);
        guard.write(observable, 30);
        expect(events.map((event) => event.own)).toEqual([true, true, true]);
        observable.setData(10);
        expect(events.at(-1)).toEqual({ value: 10, own: false });
    });

    it("写入过程中业务代码嵌套写入另一个值也按程序写入处理", () => {
        const { guard, observable, events } = setup(0);
        // 模拟 computed / 联动：程序写入触发的回调里再写一次
        observable.subscribe(() => {
            if (observable.getData() === 50 && !guard.isOwnWrite(observable)) return;
        });
        guard.write(observable, 50);
        guard.write(observable, 60);
        expect(events.map((event) => event.value)).toEqual([50, 60]);
        expect(events.every((event) => event.own)).toBe(true);
    });

    it("文本：程序同步后清空再输入相同文本都会正常触发", () => {
        const { guard, observable, events } = setup("");
        guard.write(observable, "abc");
        observable.setData("");
        observable.setData("abc");
        expect(events.map((event) => `${event.value}:${event.own}`)).toEqual([
            "abc:true",
            ":false",
            "abc:false",
        ]);
    });
});
