import type { Player } from "@minecraft/server";
import { CustomForm } from "@minecraft/server-ui";
import { LibLogger } from "../../utils/logger";
import type { SAPIProForm, SAPIProFormContext } from "../form";
import type { contextArgs } from "../interface";
import { DDUIContext } from "./context";
import { WriteGuard } from "./observable";
import { DDScope } from "./scope";
import { formStackManager } from "../stackManager";

/** 关闭旧表单到显示新表单之间等待的游戏刻（0 = 下一 tick 立即显示） */
export const DDUI_SETTLE_TICKS = 0;

/** 页面标题：可以按页面参数动态生成 */
export type DDTitle<TArgs extends contextArgs> = string | ((args: TArgs) => string);

/** 构建页面的回调：在这里描述控件与状态依赖 */
export type DDUIBuild<TArgs extends contextArgs> = (ui: DDUIContext<TArgs>, args: TArgs) => void;

/**
 * 一个 DDUI 页面。
 *
 * 它同时是一个 SAPIProForm，所以既能用 `DDUI.open()` / `ui.push()`，
 * 也能直接交给 formManager 或传统表单的 `ctx.push()`，两种表单可以共存于同一个表单栈。
 */
export interface DDUIPage<TArgs extends contextArgs = contextArgs> extends SAPIProForm<CustomForm, TArgs> {
    readonly title: DDTitle<TArgs>;
    readonly build: DDUIBuild<TArgs>;
    /** @internal 标记这是 DDUI 页面（CustomForm.show 不需要 player 参数） */
    readonly _ddui: true;
}

/** 当前仍在显示的页面（每玩家最多一个） */
const activeByPlayer = new Map<string, DDUISession>();
/** 会话直接挂在 formContext 上，随表单栈一起释放（不再用全局 WeakMap） */
type DDContextWithSession = { _dduiSession?: DDUISession };

function takeSession(context: SAPIProFormContext<any, any>): DDUISession | undefined {
    const carrier = context as DDContextWithSession;
    const session = carrier._dduiSession;
    carrier._dduiSession = undefined;
    return session;
}
/** 诊断用：尚未 dispose 的会话数（不持有引用） */
let liveSessions = 0;
let createdSessions = 0;
let disposedSessions = 0;
let createdForms = 0;

/**
 * 单个玩家的单个页面会话。
 *
 * 页面会话只负责：构建控件 → 显示 → 关闭后释放。
 * 页面跳转在关闭前写入表单栈，具体显示由 formManager 统一驱动，避免两套导航互相抢 UI。
 */
export class DDUISession {
    readonly scope = new DDScope();
    readonly writeGuard = new WriteGuard();
    readonly settleTicks = DDUI_SETTLE_TICKS;

    form?: CustomForm;
    ui?: DDUIContext<contextArgs>;
    private navigating = false;
    private disposed = false;

    constructor(
        private readonly player: Player,
        private readonly playerId: string,
        private args: contextArgs,
        private formContext: SAPIProFormContext<CustomForm, contextArgs>,
        private readonly page: DDUIPage<contextArgs>
    ) {
        liveSessions++;
        createdSessions++;
    }

    /** 构建页面并返回要显示的原生表单 */
    build(): CustomForm {
        const title = typeof this.page.title === "function" ? this.page.title(this.args) : this.page.title;
        const form = new CustomForm(this.player, title);
        createdForms++;
        this.form = form;
        const ui = new DDUIContext(this, this.formContext, form, this.args);
        this.ui = ui;
        activeByPlayer.set(this.playerId, this);
        this.page.build(ui, this.args);
        return form;
    }

    /** 按钮回调入口：页面关闭后迟到的点击、同一次显示内的连点都会忽略 */
    invoke(callback: () => void) {
        if (this.disposed || this.navigating || !this.player.isValid) return;
        try {
            callback();
        } catch (e) {
            LibLogger.error("DDUI 按钮回调异常", e);
        }
    }

    /** 修改表单栈后关闭当前表单，由 formManager 负责显示目标页面 */
    navigate(mutate: () => void) {
        if (this.disposed || this.navigating) return;
        this.navigating = true;
        try {
            mutate();
        } catch (e) {
            LibLogger.error("DDUI 页面跳转失败", e);
        }
        // 先关原生表单，再释放页面资源：从点击跳转到 show() 结算之间，
        // 页面不再接收订阅回调、也不再持有表单/页面状态（ui.closed 立刻为 true）。
        this.closeForm();
        this.dispose();
    }

    /** 关闭原生表单；已关闭或玩家已离线时静默忽略 */
    closeForm() {
        const form = this.form;
        if (!form) return;
        try {
            // 不先判断 isShowing：部分版本在玩家按 ESC 后仍报告 showing，
            // 再 close 一次可以确保原生侧释放该表单（重复 close 只会在 catch 里忽略）。
            form.close();
        } catch {
            // 已经关闭 / 玩家离开 / 表单已被其它路径关闭
        }
    }

    /** @internal 玩家是否仍然有效（用于清理真正的掉线会话） */
    isPlayerValid() {
        try {
            return this.player.isValid;
        } catch {
            return false;
        }
    }

    /** show() 结束后调用：释放页面资源 */
    finish() {
        this.dispose();
    }

    /** 释放页面资源；幂等，不抛错。释放后不再持有表单、页面参数与表单栈上下文。 */
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        liveSessions--;
        disposedSessions++;
        // 玩家按 ESC 关闭时，引擎侧可能仍把表单记为 showing；显式 close 一次，
        // 与迁移前手写面板的 dispose 一致，避免原生 UI 记录一直保留这个表单。
        this.closeForm();

        // 顶层关闭：整个 UI 会话结束，换一条空栈。
        // 旧栈（含 context / args / 已 dispose 的 session 引用）成为不可达链，
        // 立刻可回收。导航（push / back）时必须保留，上一页还要用 args 重建。
        if (!this.navigating) {
            formStackManager.resetStack(this.player);
        }

        if (activeByPlayer.get(this.playerId) === this) {
            activeByPlayer.delete(this.playerId);
        }
        this.scope.dispose();
        // 断开跨堆引用：原生表单的回调会引用页面闭包，页面若再持有表单就形成
        // 原生 <-> JS 的环，JS GC 无法回收，表现为“关了表单内存不恢复”。
        this.ui?.release();
        this.ui = undefined;
        this.form = undefined;
        this.args = undefined as never;
        this.formContext = undefined as never;
    }
}

/**
 * 定义一个 DDUI 页面。
 *
 * @param title 标题，或根据参数生成标题的函数
 * @param build 页面构建函数，页面资源由作用域自动托管
 */
export function dduiPage<TArgs extends contextArgs = contextArgs>(
    title: DDTitle<TArgs>,
    build: DDUIBuild<TArgs>
): DDUIPage<TArgs> {
    const page: DDUIPage<TArgs> = {
        _ddui: true,
        title,
        build,
        builder(player, args, context) {
            const session = new DDUISession(
                player,
                player.id,
                args as contextArgs,
                context as SAPIProFormContext<CustomForm, contextArgs>,
                page as DDUIPage<contextArgs>
            );
            (context as DDContextWithSession)._dduiSession = session;
            try {
                return session.build();
            } catch (e) {
                session.dispose();
                takeSession(context);
                throw e;
            }
        },
        handler(reason, context) {
            const session = takeSession(context);
            session?.finish();
        },
    };
    return page;
}

/** 当前玩家正在显示的 DDUI 会话（供 formManager 关闭/清理） */
export function activeDDUISession(player: Player): DDUISession | undefined {
    return activeByPlayer.get(player.id);
}

/** 释放指定表单上下文对应的页面会话（构建失败 / 展示被抢占时使用） */
export function disposeDDUISession(context: SAPIProFormContext<any, any>) {
    const session = takeSession(context);
    session?.dispose();
}

/** 强制关闭玩家的 DDUI 页面（不清空表单栈） */
export function closeDDUIPage(player: Player): boolean {
    const session = activeByPlayer.get(player.id);
    if (!session) return false;
    session.closeForm();
    session.dispose();
    return true;
}

/**
 * 清理真正掉线玩家的页面会话。
 *
 * `show()` 通常会在玩家退出时结算并自行释放；这里作为兜底，避免
 * 客户端异常断开导致会话与页面作用域一直留在内存里。
 */
export function disposeOfflineDDUISessions() {
    for (const session of [...activeByPlayer.values()]) {
        if (session.isPlayerValid()) continue;
        session.closeForm();
        session.dispose();
    }
}

/**
 * 诊断：当前仍未释放的 DDUI 会话数。
 *
 * 每次关闭表单后应为 0；反复开关若持续增长，就是真的泄漏。
 */
export function dduiStats() {
    return {
        /** 尚未 dispose 的会话数 */
        sessions: liveSessions,
        /** 正在显示的玩家数 */
        activePlayers: activeByPlayer.size,
        /** 累计创建的会话 / 已 dispose 的会话 */
        created: createdSessions,
        disposed: disposedSessions,
        /** 累计创建的原生表单数 */
        forms: createdForms,
    };
}

/**
 * 用 Promise 回调完成 DDUI 页面的“构建 → 显示 → 处理 → 继续导航”。
 *
 * 和传统表单共用 formManager 的调度，但 DDUI 的等待链不把表单/上下文
 * 挂在 async 帧上：show() 期间只保留回调需要的 session，关闭后立即释放。
 */
export function showDDUIContext(
    player: Player,
    context: SAPIProFormContext<CustomForm, contextArgs>,
    isCurrent: () => boolean,
    after: () => void
): void {
    const page = context._form as DDUIPage<contextArgs> | undefined;
    if (!page) return;

    const start = page.beforeBuild
        ? Promise.resolve()
              .then(() => page.beforeBuild!(context))
              .catch((e) => LibLogger.error("DDUI beforeBuild 异常", e))
        : Promise.resolve();

    void start.then(() => {
        if (!isCurrent()) return;

        // 构建过程中页面主动关闭/重定向：不再显示
        if (!context._willBuild) {
            after();
            return;
        }

        let form: CustomForm;
        try {
            form = page.builder(player, context.args, context) as CustomForm;
        } catch (e) {
            LibLogger.error("DDUI 构建表单失败", e);
            disposeDDUISession(context);
            const top = formStackManager.getTop(player);
            if (top === context) formStackManager.getStack(player)?.pop();
            return;
        }

        if (!isCurrent()) {
            disposeDDUISession(context);
            return;
        }
        if (!context._willBuild) {
            disposeDDUISession(context);
            after();
            return;
        }

        void form.show().then(
            (response) => {
                if (!isCurrent()) {
                    disposeDDUISession(context);
                    return;
                }
                try {
                    page.handler(response as never, context);
                } catch (e) {
                    LibLogger.error("DDUI 表单处理异常", e);
                }
                if (isCurrent()) after();
            },
            () => {
                // 玩家离开 / 表单被其它路径关闭：释放页面资源后继续
                disposeDDUISession(context);
                if (isCurrent()) after();
            }
        );
    });
}
