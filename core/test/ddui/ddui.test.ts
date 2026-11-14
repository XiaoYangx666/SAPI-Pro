// =====================================================
// DDUI 页面 / 表单栈测试
//
// 用可控的假 system + 假 CustomForm 驱动 formManager，
// 覆盖订阅释放、派生状态、导航竞争、异常与混合表单栈。
// =====================================================
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─── 假运行时（hoisted，供 vi.mock 使用）───────────────
const env = vi.hoisted(() => {
    let now = 0;
    let nextId = 1;
    let seq = 0;
    const timers = new Map<number, { at: number; order: number; fn: () => void; every?: number }>();

    const system = {
        get currentTick() {
            return now;
        },
        runTimeout(fn: () => void, ticks = 0) {
            const id = nextId++;
            timers.set(id, { at: now + Math.max(0, ticks), order: seq++, fn });
            return id;
        },
        runInterval(fn: () => void, ticks = 1) {
            const id = nextId++;
            const every = Math.max(1, ticks);
            timers.set(id, { at: now + every, order: seq++, fn, every });
            return id;
        },
        clearRun(id: number) {
            timers.delete(id);
        },
        afterEvents: {
            scriptEventReceive: { subscribe: () => () => {} },
        },
        sendScriptEvent: () => {},
    };

    function advance(ticks = 1) {
        for (let i = 0; i < ticks; i++) {
            now++;
            const due = [...timers.entries()]
                .filter(([, t]) => t.at <= now)
                .sort((a, b) => a[1].at - b[1].at || a[1].order - b[1].order);
            for (const [id, timer] of due) {
                if (!timers.has(id)) continue;
                if (timer.every) {
                    timer.at = now + timer.every;
                    timer.order = seq++;
                } else {
                    timers.delete(id);
                }
                timer.fn();
            }
        }
    }

    function reset() {
        now = 0;
        nextId = 1;
        seq = 0;
        timers.clear();
    }

    const world = {
        afterEvents: { worldLoad: { subscribe: () => () => {} } },
        beforeEvents: {},
        getPlayers: () => [],
    };

    return { system, world, advance, reset };
});

// ─── 假 @minecraft/server-ui ─────────────────────────
const ui = vi.hoisted(() => {
    type Listener<T> = (value: T) => void;

    class MockObservable<T> {
        private listeners = new Set<Listener<T>>();
        constructor(
            private value: T,
            public options?: { clientWritable?: boolean }
        ) {}
        getData() {
            return this.value;
        }
        setData(value: T) {
            if (Object.is(value, this.value)) return;
            this.value = value;
            for (const listener of [...this.listeners]) listener(value);
        }
        subscribe(callback: Listener<T>) {
            this.listeners.add(callback);
            return callback;
        }
        unsubscribe(callback: Listener<T>) {
            return this.listeners.delete(callback);
        }
        get listenerCount() {
            return this.listeners.size;
        }
    }

    class MockForm {
        static all: MockForm[] = [];
        static showError: Error | undefined;
        static busyCount = 0;
        static buildCount = 0;

        static reset() {
            MockForm.all = [];
            MockForm.showError = undefined;
            MockForm.busyCount = 0;
            MockForm.buildCount = 0;
        }

        components: Array<Record<string, any>> = [];
        showing = false;
        showCalls = 0;
        private resolveShow?: (reason: string) => void;

        constructor(
            public player: any,
            public title: any
        ) {
            MockForm.all.push(this);
        }

        show(): Promise<string> {
            this.showCalls++;
            if (MockForm.showError) {
                const error = MockForm.showError;
                MockForm.showError = undefined;
                return Promise.reject(error);
            }
            if (MockForm.busyCount > 0) {
                MockForm.busyCount--;
                return Promise.resolve("UserBusy");
            }
            this.showing = true;
            return new Promise((resolve) => {
                this.resolveShow = resolve;
            });
        }

        close() {
            if (!this.showing) throw new Error("FormVisibilityError: NotShowing");
            this.showing = false;
            this.resolveShow?.("ServerClosed");
        }

        isShowing() {
            return this.showing;
        }

        /** 模拟玩家点 X */
        playerClose() {
            this.showing = false;
            this.resolveShow?.("ClientClosed");
        }

        private push(type: string, data: Record<string, any> = {}) {
            this.components.push({ type, ...data });
            return this;
        }

        label(text: any, options?: any) {
            return this.push("label", { text, options });
        }
        header(text: any, options?: any) {
            return this.push("header", { text, options });
        }
        toggle(label: any, value: any, options?: any) {
            return this.push("toggle", { label, value, options });
        }
        slider(label: any, value: any, min: any, max: any, options?: any) {
            return this.push("slider", { label, value, min, max, options });
        }
        dropdown(label: any, value: any, items: any, options?: any) {
            return this.push("dropdown", { label, value, items, options });
        }
        textField(label: any, value: any, options?: any) {
            return this.push("textField", { label, value, options });
        }
        image(src: any, pack: any, options?: any) {
            return this.push("image", { src, pack, options });
        }
        divider(options?: any) {
            return this.push("divider", { options });
        }
        spacer(options?: any) {
            return this.push("spacer", { options });
        }
        closeButton() {
            return this.push("closeButton");
        }
        button(label: any, onClick: () => void, options?: any) {
            return this.push("button", { label, onClick, options });
        }

        buttons() {
            return this.components.filter((c) => c.type === "button");
        }
        click(index = 0) {
            this.buttons()[index]?.onClick();
        }
    }

    class MockActionForm {
        showing = false;
        showCalls = 0;
        private resolveShow?: (response: unknown) => void;
        title() {
            return this;
        }
        body() {
            return this;
        }
        button() {
            return this;
        }
        show(_player: any) {
            this.showCalls++;
            this.showing = true;
            return new Promise((resolve) => {
                this.resolveShow = resolve;
            });
        }
        playerClose() {
            this.showing = false;
            this.resolveShow?.({ canceled: true });
        }
    }

    const closedReasons = {
        ClientClosed: "ClientClosed",
        ServerClosed: "ServerClosed",
        UserBusy: "UserBusy",
    } as const;

    return {
        MockObservable,
        MockForm,
        MockActionForm,
        closedReasons,
        uiManager: { closeAllForms: vi.fn() },
        FormRejectError: class extends Error {},
        DataDrivenScreenClosedReason: closedReasons,
        ObservableBoolean: MockObservable<boolean>,
        ObservableNumber: MockObservable<number>,
        ObservableString: MockObservable<string>,
    };
});

vi.mock("@minecraft/server", () => ({
    system: env.system,
    world: env.world,
    Player: class {},
    PlayerPermissionLevel: { Operator: "operator", Member: "member" },
}));

vi.mock("@minecraft/server-ui", () => ({
    CustomForm: ui.MockForm,
    ActionFormData: ui.MockActionForm,
    ModalFormData: ui.MockActionForm,
    MessageFormData: ui.MockActionForm,
    ObservableBoolean: ui.ObservableBoolean,
    ObservableNumber: ui.ObservableNumber,
    ObservableString: ui.ObservableString,
    ObservableUIRawMessage: ui.MockObservable,
    FormRejectError: ui.FormRejectError,
    DataDrivenScreenClosedReason: ui.DataDrivenScreenClosedReason,
    uiManager: ui.uiManager,
}));

// ─── Imports（必须在 mock 之后）────────────────────────
import type { Player } from "@minecraft/server";
import { DDUI, dduiPage, type DDUIContext } from "../../src/Form/ddui/main";
import { DDScope } from "../../src/Form/ddui/scope";
import { formManager } from "../../src/Form/formManager";
import { formStackManager } from "../../src/Form/stackManager";
import type { SAPIProForm } from "../../src/Form/form";

const MockForm = ui.MockForm;
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** 推进游戏刻并让 async show 链路跑完 */
async function settle(ticks = 6) {
    for (let i = 0; i < ticks; i++) {
        env.advance(1);
        await flush();
    }
}

let playerSeq = 0;
function createPlayer() {
    const id = `player-${++playerSeq}`;
    return {
        id,
        isValid: true,
        dimension: { id: "minecraft:overworld" },
        location: { x: 0, y: 0, z: 0 },
        sendMessage: vi.fn(),
        setDynamicProperty: vi.fn(),
        getDynamicProperty: vi.fn(() => undefined),
    } as unknown as Player;
}

function lastForm() {
    return MockForm.all[MockForm.all.length - 1];
}

function stackDepth(player: Player) {
    return formStackManager.getStack(player)?.depth ?? 0;
}

/** 传统表单替身：记录实例，便于模拟玩家关窗 */
const legacyInstances: Array<InstanceType<typeof ui.MockActionForm>> = [];

function makeLegacyForm(
    onHandler: (ctx: any) => void,
    log: string[] = []
): SAPIProForm<any, any> {
    return {
        builder() {
            log.push("legacy:show");
            const form = new ui.MockActionForm();
            legacyInstances.push(form);
            return form as any;
        },
        handler(_response, ctx) {
            log.push("legacy:handler");
            onHandler(ctx);
        },
    };
}

beforeEach(() => {
    env.reset();
    MockForm.reset();
    legacyInstances.length = 0;
    vi.clearAllMocks();
});

afterEach(() => {
    for (const form of MockForm.all) form.showing = false;
    for (const form of legacyInstances) form.showing = false;
});

// =====================================================
describe("DDUI 状态与作用域", () => {
    it("页面关闭后自动退订 Observable，迟到的回调不再执行", async () => {
        const player = createPlayer();
        const calls: number[] = [];
        let volume: any;

        const page = dduiPage("测试", (ctx) => {
            volume = ctx.number(10);
            ctx.onChange(volume, (value) => calls.push(value));
        });

        DDUI.open(player, page);
        await settle();
        const form = lastForm();

        volume.setData(20);
        expect(calls).toEqual([20]);
        expect(volume.listenerCount).toBe(1);

        form.playerClose();
        await settle();

        expect(volume.listenerCount).toBe(0);
        volume.setData(30);
        expect(calls).toEqual([20]);
        expect(DDUI.active(player)).toBeUndefined();
    });

    it("ui.set 的服务器写入不触发 onChange，客户端写入会", async () => {
        const player = createPlayer();
        const calls: number[] = [];
        let volume: any;
        let ctxRef: DDUIContext | undefined;

        const page = dduiPage("测试", (ctx) => {
            ctxRef = ctx;
            volume = ctx.number(0);
            ctx.onChange(volume, (value) => calls.push(value));
        });

        DDUI.open(player, page);
        await settle();

        ctxRef!.set(volume, 42);
        expect(volume.getData()).toBe(42);
        expect(calls).toEqual([]);

        volume.setData(43);
        expect(calls).toEqual([43]);

        // 程序写入：自身通知被屏蔽；同值再写不会产生通知
        ctxRef!.set(volume, 50);
        volume.setData(50);
        expect(calls).toEqual([43]);

        lastForm().playerClose();
        await settle();
    });

    it("computed 跟随多个依赖更新，关闭后停止计算", async () => {
        const player = createPlayer();
        const computedValues: string[] = [];
        let volume: any;
        let enabled: any;
        let label: any;

        const page = dduiPage("测试", (ctx) => {
            volume = ctx.number(100);
            enabled = ctx.boolean(true);
            label = ctx.computed([volume, enabled], () =>
                enabled.getData() ? `音量 ${volume.getData()}` : "已静音"
            );
            ctx.onChange(label, (value) => computedValues.push(value));
        });

        DDUI.open(player, page);
        await settle();

        expect(label.getData()).toBe("音量 100");
        volume.setData(120);
        expect(label.getData()).toBe("音量 120");
        enabled.setData(false);
        expect(label.getData()).toBe("已静音");
        expect(computedValues).toEqual(["音量 120", "已静音"]);

        lastForm().playerClose();
        await settle();
        // 页面文本在关闭时清空；之后依赖再变化也不会重算
        expect(label.getData()).toBe("");
        volume.setData(200);
        expect(label.getData()).toBe("");
        expect(label.listenerCount).toBe(0);
    });

    it("页面关闭会取消定时器，关闭后不会执行", async () => {
        const player = createPlayer();
        const fired: string[] = [];

        const page = dduiPage("测试", (ctx) => {
            ctx.timeout(() => fired.push("late"), 5);
            ctx.interval(() => fired.push("tick"), 10);
        });

        DDUI.open(player, page);
        await settle(2);
        expect(fired).toEqual([]);

        lastForm().playerClose();
        await settle(12);
        expect(fired).toEqual([]);
    });

    it("作用域重复释放只执行一次，单个清理失败不影响其它清理", () => {
        const scope = new DDScope();
        const calls: string[] = [];
        scope.own(() => calls.push("a"), "a");
        scope.own(() => {
            calls.push("boom");
            throw new Error("boom");
        }, "boom");
        scope.own(() => calls.push("c"), "c");

        scope.dispose();
        scope.dispose();

        expect(calls).toEqual(["c", "boom", "a"]);
        expect(scope.isClosed).toBe(true);
    });

    it("外部 Signal 订阅随页面释放", async () => {
        const player = createPlayer();
        const listeners = new Set<(value: void) => void>();
        const signal = {
            subscribe(callback: (value: void) => void) {
                listeners.add(callback);
                return () => listeners.delete(callback);
            },
            publish() {
                for (const listener of [...listeners]) listener();
            },
        };
        let received = 0;

        const page = dduiPage("测试", (ctx) => {
            ctx.subscribe(signal, () => received++);
        });

        DDUI.open(player, page);
        await settle();
        expect(listeners.size).toBe(1);

        signal.publish();
        expect(received).toBe(1);

        lastForm().playerClose();
        await settle();
        expect(listeners.size).toBe(0);
    });

    it("服务器周期性同步不会触发玩家输入回调", async () => {
        const player = createPlayer();
        const calls: number[] = [];
        let ctxRef: DDUIContext | undefined;
        let volume: any;

        const page = dduiPage("同步", (ctx) => {
            ctxRef = ctx;
            volume = ctx.number(0);
            ctx.onChange(volume, (value) => calls.push(value));
        });

        DDUI.open(player, page);
        await settle();

        for (let i = 1; i <= 20; i++) ctxRef!.set(volume, i);
        expect(volume.getData()).toBe(20);
        expect(calls).toEqual([]);

        volume.setData(21);
        expect(calls).toEqual([21]);

        lastForm().playerClose();
        await settle();
    });

    it("反复打开关闭不会累积订阅或页面资源", async () => {
        const player = createPlayer();
        const listeners = new Set<(value: void) => void>();
        const signal = {
            subscribe(callback: (value: void) => void) {
                listeners.add(callback);
                return () => listeners.delete(callback);
            },
        };
        let builds = 0;

        const page = dduiPage("循环", (ctx) => {
            builds++;
            ctx.subscribe(signal, () => {});
        });

        for (let i = 0; i < 30; i++) {
            DDUI.open(player, page);
            await settle(2);
            expect(listeners.size).toBe(1);

            lastForm().playerClose();
            await settle(2);
            expect(listeners.size).toBe(0);
        }

        expect(builds).toBe(30);
        expect(MockForm.all).toHaveLength(30);
    });

    it("ui.subscribe 订阅原生 Observable：关闭后真正退订，不再留监听", async () => {
        const player = createPlayer();
        const shared = new ui.MockObservable("a");
        let calls = 0;

        const page = dduiPage("原生订阅", (ctx) => {
            ctx.subscribe(shared, () => calls++);
        });

        DDUI.open(player, page);
        await settle();
        expect(shared.listenerCount).toBe(1);

        shared.setData("b");
        expect(calls).toBe(1);

        lastForm().playerClose();
        await settle();

        // 关键：共享 Observable 上的监听必须归零，否则每次开页面都会累积
        expect(shared.listenerCount).toBe(0);
        shared.setData("c");
        expect(calls).toBe(1);
    });

    it("反复开关不会在共享 Observable 上累积监听", async () => {
        const player = createPlayer();
        const shared = new ui.MockObservable(0);
        const baseline = DDUI.stats().sessions;
        const page = dduiPage("反复订阅", (ctx) => {
            ctx.subscribe(shared, () => {});
        });

        for (let i = 0; i < 20; i++) {
            DDUI.open(player, page);
            await settle(2);
            expect(shared.listenerCount).toBe(1);
            expect(DDUI.stats().sessions).toBe(baseline + 1);

            lastForm().playerClose();
            await settle(2);
            expect(shared.listenerCount).toBe(0);
            // 会话必须回到基线，否则就是会话对象泄漏
            expect(DDUI.stats().sessions).toBe(baseline);
            expect(DDUI.stats().activePlayers).toBe(0);
        }
    });

    it("关闭后清空页面级文本 Observable，不把长字符串留给原生表单", async () => {
        const player = createPlayer();
        let label: any;
        const page = dduiPage("文本页", (ctx) => {
            label = ctx.string("x".repeat(500), { clientWritable: false });
        });

        DDUI.open(player, page);
        await settle();
        expect(label.getData()).toHaveLength(500);

        lastForm().playerClose();
        await settle();

        expect(label.getData()).toBe("");
        expect(DDUI.active(player)).toBeUndefined();
    });

    it("共享 ViewModel 用 retain 托管，关闭时只 release 不销毁", async () => {
        const player = createPlayer();
        const viewModel = {
            refs: 0,
            disposed: false,
            retain() {
                this.refs++;
            },
            release() {
                this.refs--;
            },
            dispose() {
                this.disposed = true;
            },
        };

        const page = dduiPage("测试", (ctx) => {
            ctx.retain(viewModel);
        });

        DDUI.open(player, page);
        await settle();
        expect(viewModel.refs).toBe(1);

        lastForm().playerClose();
        await settle();
        expect(viewModel.refs).toBe(0);
        expect(viewModel.disposed).toBe(false);
    });
});

// =====================================================
describe("DDUI 表单栈与导航", () => {
    function plainPage(name: string) {
        return dduiPage(name, (ctx) => ctx.label(name));
    }

    it("open 会显示页面并按标题创建表单", async () => {
        const player = createPlayer();

        DDUI.open(player, plainPage("主页"), {});
        await settle();

        expect(MockForm.all).toHaveLength(1);
        expect(lastForm().title).toBe("主页");
        expect(lastForm().isShowing()).toBe(true);
        expect(DDUI.active(player)).toBeDefined();
        expect(stackDepth(player)).toBe(1);

        lastForm().playerClose();
        await settle();
    });

    it("push / back 保留父页面参数并重建页面状态", async () => {
        const player = createPlayer();
        const builds: string[] = [];
        let volume: any;
        let parentUi: DDUIContext<{ volume: number }> | undefined;

        const child = dduiPage("子页", (ctx) => {
            ctx.button("返回", () => ctx.back());
        });

        const parent = dduiPage<{ volume: number }>("父页", (ctx) => {
            builds.push(`parent:${ctx.args.volume}`);
            parentUi = ctx;
            volume = ctx.number(ctx.args.volume);
            ctx.onChange(volume, (value) => {
                ctx.args.volume = value;
            });
            ctx.button("打开子页", () => ctx.push(child));
        });

        DDUI.open(player, parent, { volume: 30 });
        await settle();
        const parentForm = lastForm();

        volume.setData(45);
        expect(parentUi!.args.volume).toBe(45);

        parentForm.click(0);
        await settle();

        expect(parentForm.isShowing()).toBe(false);
        expect(lastForm().isShowing()).toBe(true);
        expect(stackDepth(player)).toBe(2);

        lastForm().click(0); // 子页「返回」
        await settle();

        expect(stackDepth(player)).toBe(1);
        expect(builds).toEqual(["parent:30", "parent:45"]);
        expect(lastForm().isShowing()).toBe(true);
        expect(volume.getData()).toBe(45);

        lastForm().playerClose();
        await settle();
    });

    it("子页面被玩家关闭时回退上一层，根页面关闭才清空栈", async () => {
        const player = createPlayer();
        let builds = 0;
        const child = dduiPage("子页", (ctx) => ctx.label("child"));
        const parent = dduiPage("父页", (ctx) => {
            builds++;
            ctx.button("子页", () => ctx.push(child));
        });

        DDUI.open(player, parent);
        await settle();
        lastForm().click(0);
        await settle();
        expect(stackDepth(player)).toBe(2);
        const childForm = lastForm();

        // 玩家按 ESC / 关闭按钮：只回退一层，父页面重建并重新显示
        childForm.playerClose();
        await settle();
        expect(childForm.isShowing()).toBe(false);
        expect(stackDepth(player)).toBe(1);
        expect(builds).toBe(2);
        expect(lastForm().title).toBe("父页");
        expect(lastForm().isShowing()).toBe(true);

        // 根页面关闭：清空栈并结束界面
        lastForm().playerClose();
        await settle();
        expect(stackDepth(player)).toBe(0);
        expect(DDUI.active(player)).toBeUndefined();
    });

    it("快速连续点击只会执行一次导航", async () => {
        const player = createPlayer();
        const child = plainPage("子页");
        const parent = dduiPage("父页", (ctx) => {
            ctx.button("子页", () => ctx.push(child));
        });

        DDUI.open(player, parent);
        await settle();
        const form = lastForm();

        form.click(0);
        form.click(0);
        form.click(0);
        await settle();

        expect(stackDepth(player)).toBe(2);
        expect(MockForm.all).toHaveLength(2);
        expect(DDUI.active(player)).toBeDefined();

        // 子页关闭会回到父页；这里直接结束整个界面做清理
        formManager.close(player);
        await settle();
    });

    it("replace 不增加栈深度", async () => {
        const player = createPlayer();
        const second = plainPage("第二页");
        const first = dduiPage("第一页", (ctx) => {
            ctx.button("replace", () => ctx.replace(second));
        });

        DDUI.open(player, first);
        await settle();
        lastForm().click(0);
        await settle();

        expect(stackDepth(player)).toBe(1);
        expect(lastForm().title).toBe("第二页");
        expect(lastForm().isShowing()).toBe(true);

        lastForm().playerClose();
        await settle();
    });

    it("reset 清空栈并打开新页", async () => {
        const player = createPlayer();
        const third = plainPage("第三页");
        const first = dduiPage("第一页", (ctx) => {
            ctx.button("reset", () => ctx.reset(third));
        });

        DDUI.open(player, first);
        await settle();
        lastForm().click(0);
        await settle();

        expect(stackDepth(player)).toBe(1);
        expect(lastForm().title).toBe("第三页");
        expect(lastForm().isShowing()).toBe(true);

        lastForm().playerClose();
        await settle();
    });

    it("reopen 用当前参数重建当前页", async () => {
        const player = createPlayer();
        let builds = 0;
        const page = dduiPage("重开", (ctx) => {
            builds++;
            ctx.button("重建", () => ctx.reopen());
        });

        DDUI.open(player, page);
        await settle();
        expect(builds).toBe(1);

        lastForm().click(0);
        await settle();
        expect(builds).toBe(2);
        expect(stackDepth(player)).toBe(1);

        lastForm().playerClose();
        await settle();
    });

    it("关闭后的按钮回调不会再次导航", async () => {
        const player = createPlayer();
        const child = plainPage("子页");
        const parent = dduiPage("父页", (ctx) => {
            ctx.button("子页", () => ctx.push(child));
        });

        DDUI.open(player, parent);
        await settle();
        const form = lastForm();
        const onClick = form.buttons()[0].onClick;

        form.playerClose();
        await settle();
        expect(DDUI.active(player)).toBeUndefined();

        onClick();
        await settle();
        // 顶层关闭后栈已重置，迟到的按钮回调也没有可操作页面
        expect(stackDepth(player)).toBe(0);
        expect(MockForm.all).toHaveLength(1);
    });

    it("外部重复 open 会先关掉旧界面，不会有两个表单抢 UI", async () => {
        const player = createPlayer();

        DDUI.open(player, plainPage("A"));
        await settle();
        const formA = lastForm();
        expect(formA.isShowing()).toBe(true);

        DDUI.open(player, plainPage("B"));
        await settle();

        expect(formA.isShowing()).toBe(false);
        expect(lastForm().title).toBe("B");
        expect(lastForm().isShowing()).toBe(true);
        expect(stackDepth(player)).toBe(1);

        lastForm().playerClose();
        await settle();
    });

    it("两次 open 竞争时只有后一次生效", async () => {
        const player = createPlayer();

        DDUI.open(player, plainPage("A"));
        DDUI.open(player, plainPage("B"));
        await settle();

        expect(MockForm.all.filter((form) => form.isShowing())).toHaveLength(1);
        expect(lastForm().title).toBe("B");
        expect(stackDepth(player)).toBe(1);

        lastForm().playerClose();
        await settle();
    });

    it("show 抛出异常时释放页面资源且不抛给调用方", async () => {
        const player = createPlayer();
        let cleaned = 0;
        const page = dduiPage("异常", (ctx) => {
            ctx.onClose(() => cleaned++);
        });

        MockForm.showError = new Error("boom");
        DDUI.open(player, page);
        await settle();

        expect(cleaned).toBe(1);
        expect(DDUI.active(player)).toBeUndefined();

        DDUI.open(player, plainPage("正常"));
        await settle();
        expect(lastForm().title).toBe("正常");
        lastForm().playerClose();
        await settle();
    });

    it("DDUI.open 支持逐次 delay：到点前不构建，到点后显示", async () => {
        const player = createPlayer();
        let builds = 0;
        const page = dduiPage("延迟", (ctx) => {
            builds++;
            ctx.label("x");
        });

        DDUI.open(player, page, undefined, 4);
        await settle(3);
        expect(builds).toBe(0);
        expect(MockForm.all).toHaveLength(0);

        await settle(2);
        expect(builds).toBe(1);
        expect(lastForm().isShowing()).toBe(true);

        lastForm().playerClose();
        await settle();
    });

    it("顶层关闭后立即重置表单栈，args 立刻释放", async () => {
        const player = createPlayer();
        const heavy = { payload: new Array(64).fill("x") };
        const page = dduiPage("清理", (ctx) => ctx.label("x"));

        DDUI.open(player, page, heavy as any);
        await settle();
        expect(formStackManager.getTop(player)?.args).toBe(heavy);

        lastForm().playerClose();
        await settle();

        expect(stackDepth(player)).toBe(0);
        expect(formStackManager.getTop(player)).toBeUndefined();
    });

    it("UserBusy 不重试：本次打开直接结束", async () => {
        const player = createPlayer();
        let builds = 0;
        const page = dduiPage("忙", (ctx) => {
            builds++;
            ctx.label("busy");
        });

        MockForm.busyCount = 5;
        DDUI.open(player, page);
        await settle(20);

        expect(builds).toBe(1);
        expect(MockForm.all).toHaveLength(1);
        expect(MockForm.all.every((form) => !form.isShowing())).toBe(true);
        expect(DDUI.active(player)).toBeUndefined();
    });

    it("玩家离线时不构建表单", async () => {
        const player = createPlayer();
        (player as unknown as { isValid: boolean }).isValid = false;
        let builds = 0;

        DDUI.open(
            player,
            dduiPage("离线", (ctx) => {
                builds++;
                ctx.label("x");
            })
        );
        await settle();

        expect(builds).toBe(0);
        expect(MockForm.all).toHaveLength(0);
    });

    it("构建时主动关闭不会显示空表单", async () => {
        const player = createPlayer();
        const page = dduiPage("空页", (ctx) => {
            ctx.close();
        });

        DDUI.open(player, page);
        await settle();

        expect(MockForm.all.filter((form) => form.isShowing())).toHaveLength(0);
        expect(DDUI.active(player)).toBeUndefined();
    });

    it("导航排队期间被外部关闭时，旧页面不会再显示", async () => {
        const player = createPlayer();
        const child = plainPage("子页");
        const parent = dduiPage("父页", (ctx) => {
            ctx.button("子页", () => ctx.push(child));
        });

        DDUI.open(player, parent);
        await settle();
        lastForm().click(0);
        await flush();

        // 子页在 2 tick 后才会显示，这之前清空栈
        formManager.close(player);
        await settle(6);

        expect(MockForm.all).toHaveLength(1);
        expect(MockForm.all.filter((form) => form.isShowing())).toHaveLength(0);
        expect(formManager.isShowing(player)).toBe(false);
    });

    it("点击跳转后页面立即失效，订阅与状态写入都已停止", async () => {
        const player = createPlayer();
        const child = plainPage("子页");
        let closedInClick: boolean | undefined;
        let volume: any;
        const calls: number[] = [];

        const parent = dduiPage("父页", (ctx) => {
            volume = ctx.number(0);
            ctx.onChange(volume, (value) => calls.push(value));
            ctx.button("子页", () => {
                ctx.push(child);
                closedInClick = ctx.closed;
            });
        });

        DDUI.open(player, parent);
        await settle();
        volume.setData(5);
        expect(calls).toEqual([5]);

        lastForm().click(0);
        expect(closedInClick).toBe(true);
        expect(volume.listenerCount).toBe(0);

        await settle();
        // 旧页面的 Observable 再变化也不会触发回调
        volume.setData(6);
        expect(calls).toEqual([5]);
        expect(lastForm().title).toBe("子页");
    });

    it("构建时 push 新页面会直接显示新页面（构建期重定向）", async () => {
        const player = createPlayer();
        const target = plainPage("目标");
        const page = dduiPage("构建期跳转", (ctx) => {
            ctx.push(target);
        });

        DDUI.open(player, page);
        await settle();

        expect(stackDepth(player)).toBe(2);
        expect(lastForm().title).toBe("目标");
        expect(lastForm().isShowing()).toBe(true);
        expect(MockForm.all.filter((form) => form.isShowing())).toHaveLength(1);
    });

    it("重复关闭安全，清理只执行一次", async () => {
        const player = createPlayer();
        let cleaned = 0;
        const page = dduiPage("关闭", (ctx) => {
            ctx.onClose(() => cleaned++);
        });

        DDUI.open(player, page);
        await settle();

        formManager.close(player);
        formManager.close(player);
        await settle();

        expect(cleaned).toBe(1);
        expect(MockForm.all.every((form) => !form.isShowing())).toBe(true);
    });
});

// =====================================================
describe("DDUI 与传统表单混合入栈", () => {
    it("DDUI 页面 push 传统表单，传统表单 back 回到 DDUI 页面", async () => {
        const player = createPlayer();
        const log: string[] = [];
        const child = makeLegacyForm((ctx) => ctx.back(), log);
        const parent = dduiPage("父页", (ctx) => {
            log.push("parent:build");
            ctx.button("传统表单", () => ctx.push(child));
        });

        DDUI.open(player, parent);
        await settle();
        expect(log).toEqual(["parent:build"]);

        lastForm().click(0);
        await settle();

        expect(log).toContain("legacy:show");
        expect(stackDepth(player)).toBe(2);

        legacyInstances[legacyInstances.length - 1].playerClose();
        await settle();

        expect(log).toContain("legacy:handler");
        expect(stackDepth(player)).toBe(1);
        expect(log.filter((item) => item === "parent:build")).toHaveLength(2);
        expect(lastForm().isShowing()).toBe(true);

        lastForm().playerClose();
        await settle();
    });

    it("传统表单可以 push DDUI 页面", async () => {
        const player = createPlayer();
        const log: string[] = [];
        const target = dduiPage("目标页", (ctx) => {
            log.push("target:build");
            ctx.label("target");
        });
        const legacy = makeLegacyForm((ctx) => ctx.push(target));

        formManager.open(player, legacy);
        await settle();
        legacyInstances[legacyInstances.length - 1].playerClose();
        await settle();

        expect(log).toContain("target:build");
        expect(lastForm().title).toBe("目标页");
        expect(lastForm().isShowing()).toBe(true);
        expect(stackDepth(player)).toBe(2);

        lastForm().playerClose();
        await settle();
    });

    it("DDUI / 传统表单多层混合入栈后可以逐层返回", async () => {
        const player = createPlayer();
        const log: string[] = [];
        const pageB = dduiPage("B", (ctx) => {
            log.push("B");
            ctx.button("返回", () => ctx.back());
        });
        // 第一次关闭进入 B，第二次关闭返回 A（模拟“子页面返回”与“关闭返回上级”两种语义）
        let legacyCloses = 0;
        const legacy = makeLegacyForm((ctx) => {
            legacyCloses++;
            if (legacyCloses === 1) ctx.push(pageB);
            else ctx.back();
        }, log);
        let buildsA = 0;
        const pageA = dduiPage("A", (ctx) => {
            buildsA++;
            log.push("A");
            ctx.button("传统表单", () => ctx.push(legacy));
        });

        DDUI.open(player, pageA);
        await settle();
        expect(stackDepth(player)).toBe(1);

        lastForm().click(0); // A → 传统表单
        await settle();
        expect(stackDepth(player)).toBe(2);
        expect(log).toContain("legacy:show");

        legacyInstances[legacyInstances.length - 1].playerClose(); // 传统表单 → B
        await settle();
        expect(stackDepth(player)).toBe(3);
        expect(lastForm().title).toBe("B");

        lastForm().click(0); // B → 返回传统表单
        await settle();
        expect(stackDepth(player)).toBe(2);
        expect(log.filter((item) => item === "legacy:show")).toHaveLength(2);

        legacyInstances[legacyInstances.length - 1].playerClose(); // 传统表单 → 返回 A
        await settle();
        expect(stackDepth(player)).toBe(1);
        expect(lastForm().title).toBe("A");
        expect(buildsA).toBe(2);
        expect(lastForm().isShowing()).toBe(true);

        lastForm().playerClose();
        await settle();
    });
});
