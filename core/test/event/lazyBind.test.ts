// =====================================================
// Event 总线 - 惰性订阅测试
//
// 覆盖：导入时不得建立 runInterval / itemUse / chatSend 监听（没用该功能的包就不订阅）；
// 首个订阅者到来才启动；worldLoad 之前订阅要等加载后启动；重复订阅不会重复启动；
// formManager 只在有表单要展示时才订阅 min 清理。
// =====================================================
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mock 状态（vi.mock 工厂会被提升，不能引用普通外部变量）───
const mocks = vi.hoisted(() => {
    const worldLoadCallbacks: (() => void)[] = [];
    return {
        worldLoadCallbacks,
        itemUseSubscribe: vi.fn(),
        chatSendSubscribe: vi.fn(),
        scriptEventSubscribe: vi.fn(),
        startupSubscribe: vi.fn(),
        runInterval: vi.fn(() => 1),
        clearRun: vi.fn(),
        runTimeout: vi.fn(),
    };
});

// ─── Mock @minecraft/server ───────────────────────────
vi.mock("@minecraft/server", () => ({
    world: {
        getAllPlayers: vi.fn(() => []),
        getDimension: vi.fn(() => ({})),
        beforeEvents: {
            chatSend: { subscribe: mocks.chatSendSubscribe },
        },
        afterEvents: {
            worldLoad: {
                subscribe: (cb: () => void) => {
                    mocks.worldLoadCallbacks.push(cb);
                    return cb;
                },
            },
            itemUse: { subscribe: mocks.itemUseSubscribe },
        },
    },
    system: {
        run: vi.fn((cb: () => void) => {
            cb();
            return 0;
        }),
        runTimeout: mocks.runTimeout,
        runInterval: mocks.runInterval,
        clearRun: mocks.clearRun,
        beforeEvents: {
            startup: { subscribe: mocks.startupSubscribe },
        },
        afterEvents: {
            scriptEventReceive: { subscribe: mocks.scriptEventSubscribe },
        },
    },
    Player: class {},
    Entity: class {},
    Vector3: Object,
    VectorXZ: Object,
    RawMessage: Object,
    PlayerPermissionLevel: { Operator: "operator", Member: "member" },
}));

// ─── Mock @minecraft/server-ui（formManager 只用到 FormRejectError）───
vi.mock("@minecraft/server-ui", () => ({
    FormRejectError: class extends Error {},
    ActionFormData: class {},
    MessageFormData: class {},
    ModalFormData: class {},
}));

// ─── Imports (after mocks) ───────────────────────────
import { intervalBusClass, itemBase } from "../../src/Event";
import { formManager } from "../../src/Form/formManager";

// 记录"模块导入阶段"是否建立了监听——这个值必须在任何 mockClear 之前取
const callsAtImport = {
    runInterval: mocks.runInterval.mock.calls.length,
    itemUse: mocks.itemUseSubscribe.mock.calls.length,
    chatSend: mocks.chatSendSubscribe.mock.calls.length,
};

/** 触发所有已登记的 worldLoad 回调，模拟世界加载完成 */
function fireWorldLoad() {
    for (const cb of mocks.worldLoadCallbacks.splice(0)) cb();
}

describe("Event 总线惰性订阅", () => {
    beforeEach(() => {
        mocks.runInterval.mockClear();
        mocks.clearRun.mockClear();
        mocks.itemUseSubscribe.mockClear();
        // 注意：不清空 worldLoadCallbacks，否则单例登记的回调会丢失、worldLoaded 永远为 false
    });

    it("导入模块时不会建立 runInterval / itemUse / chatSend 监听", () => {
        expect(callsAtImport.runInterval).toBe(0);
        expect(callsAtImport.itemUse).toBe(0);
        expect(callsAtImport.chatSend).toBe(0);
        // ScriptEventBus 仍按设计常驻（跨包 form:open 需要被动接收）
        expect(mocks.scriptEventSubscribe).toHaveBeenCalled();
    });

    it("worldLoad 之前订阅只登记，加载完成后才启动定时器", () => {
        const bus = new intervalBusClass();
        bus.subscribemin(vi.fn());
        expect(mocks.runInterval).not.toHaveBeenCalled();

        fireWorldLoad();
        expect(mocks.runInterval).toHaveBeenCalledTimes(1);
    });

    it("worldLoad 之后订阅会立即启动定时器", () => {
        const bus = new intervalBusClass();
        fireWorldLoad();

        bus.subscribetick(vi.fn());
        expect(mocks.runInterval).toHaveBeenCalledTimes(1);
    });

    it("重复订阅不会重复启动定时器", () => {
        const bus = new intervalBusClass();
        fireWorldLoad();
        bus.subscribemin(vi.fn());
        bus.subscribesec(vi.fn());
        bus.subscribetick(vi.fn());
        expect(mocks.runInterval).toHaveBeenCalledTimes(1);
    });

    it("itemBus 首次 bind 才订阅 itemUse，重复 bind 不重复订阅", () => {
        const bus = new itemBase();
        expect(mocks.itemUseSubscribe).not.toHaveBeenCalled();

        bus.bind("minecraft:apple", vi.fn());
        expect(mocks.itemUseSubscribe).toHaveBeenCalledTimes(1);

        bus.bind("minecraft:bread", vi.fn());
        expect(mocks.itemUseSubscribe).toHaveBeenCalledTimes(1);
    });

    it("formManager 只在有表单要展示时才订阅 min 清理", () => {
        fireWorldLoad();
        mocks.runInterval.mockClear();
        // 单例 intervalBus 此刻不应有订阅者，故定时器未启动
        expect(mocks.runInterval).not.toHaveBeenCalled();

        const form = { builder: vi.fn(), handler: vi.fn() };
        formManager.open({ id: "player-1", isValid: true } as any, form as any);

        // 打开表单 → 订阅 min 清理 → intervalBus 启动定时器
        expect(mocks.runInterval).toHaveBeenCalledTimes(1);
    });
});
