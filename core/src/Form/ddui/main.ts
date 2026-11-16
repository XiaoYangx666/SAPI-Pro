import type { Player } from "@minecraft/server";
import { formManager } from "../formManager";
import type { contextArgs } from "../interface";
import { activeDDUISession, dduiPage, dduiStats, type DDUIPage } from "./page";

export * from "./scope";
export * from "./observable";
export * from "./context";
export * from "./page";

/**
 * DDUI 响应式表单入口。
 *
 * ```ts
 * const settings = DDUI.page("钢琴设置", (ui, args) => {
 *     const volume = ui.number(100);
 *     ui.onChange(volume, value => saveVolume(value));
 *     ui.label(ui.computed([volume], () => `当前音量：${volume.getData()}%`));
 *     ui.slider("音量", volume, 0, 200, { step: 1 });
 *     ui.button("曲谱设置", () => ui.push(scorePage, { piano: args.piano }));
 * });
 *
 * DDUI.open(player, settings, { piano });
 * ```
 */
export const DDUI = {
    /** 定义一个可复用、可入栈的页面 */
    page: dduiPage,
    /**
     * 清空表单栈并打开页面。
     * @param delay 等待的游戏刻；0 表示下一 tick 显示（`system.runTimeout(..., 0)`）
     */
    open<TArgs extends contextArgs>(
        player: Player,
        page: DDUIPage<TArgs>,
        args?: TArgs,
        delay = 0
    ) {
        formManager.open(player, page, args, delay);
    },
    /** 关闭当前界面并清空表单栈 */
    close(player: Player) {
        formManager.close(player);
    },
    /** 当前玩家正在显示的页面上下文（没有则为 undefined） */
    active(player: Player) {
        return activeDDUISession(player)?.ui;
    },
    /**
     * 诊断：当前未释放的 DDUI 会话数（关闭后应为 0）。
     * 用于确认反复开关是否真的在累积资源。
     */
    stats() {
        return { ...dduiStats(), ...formManager.dduiShowStats() };
    },
};
