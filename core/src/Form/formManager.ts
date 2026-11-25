import { Player, ScriptEventCommandMessageAfterEvent, system } from "@minecraft/server";
import { CustomForm, FormRejectError, uiManager } from "@minecraft/server-ui";
import { LibConfig } from "../Config";
import { ScriptEventBus, intervalBus } from "../Event";
import { LibErrorMes, getPlayerById } from "../func";
import { SAPIProForm, SAPIProFormContext } from "./form";
import { contextArgs, formDataType, FormLike, openFormData } from "./interface";
import { formStackManager } from "./stackManager";
import { DDUI_SETTLE_TICKS, activeDDUISession, closeDDUIPage, disposeDDUISession, disposeOfflineDDUISessions, showDDUIContext } from "./ddui/page";

interface SAPIProFormBatchRegister {
    [key: string]: FormLike<any>;
}

class FormNotFoundError extends Error {
    formName: string;
    constructor(mes: string, name: string) {
        super(mes);
        this.formName = name;
    }
}

/** 正常的“表单结束”异常：玩家关窗、离开游戏、表单被另一条路径关闭 */
function isBenignShowError(error: unknown) {
    if (error instanceof FormRejectError) return true;
    const e = error as { name?: string; reason?: string } | undefined;
    // 名称兜底：当前 @minecraft/server 类型里只有 FormVisibilityError / InvalidEntityError，
    // PlayerLeftError 等不存在于类型定义，只作为运行时/历史错误名按“正常结束”处理。
    return (
        e?.name === "PlayerLeftError" ||
        e?.name === "FormVisibilityError" ||
        e?.name === "InvalidEntityError" ||
        e?.reason === "PlayerQuit" ||
        e?.reason === "ServerShutdown" ||
        e?.reason === "AlreadyShowing" ||
        e?.reason === "NotShowing"
    );
}

function closeAllForms(player: Player) {
    try {
        (uiManager as { closeAllForms?: (player: Player) => void } | undefined)?.closeAllForms?.(player);
    } catch {
        // 没有可关闭的表单 / 旧版本没有该 API
    }
}

export class FormManagerClass {
    private forms = new Map<string, FormLike<any>>();
    /**min 清理定时器是否已订阅（没开过表单的包就不会订阅） */
    private minBound = false;
    /** 正在显示传统表单的玩家，用于在重新打开时先关掉旧界面 */
    private showingLegacy = new Set<string>();

    /**有表单要展示时才订阅 min 清理，之后不再退订 */
    private ensureMinTick() {
        if (this.minBound) return;
        this.minBound = true;
        intervalBus.subscribemin(() => {
            formStackManager.clearOff();
            disposeOfflineDDUISessions();
        });
    }

    /**@internal 不要调用，不要调用，不要调用 */
    _bind() {
        ScriptEventBus.bind("form:open", this.listen.bind(this));
    }

    /**注册一个具名表单 */
    registerNamed<TArgs extends contextArgs>(name: string, form: FormLike<TArgs>) {
        this.forms.set(name, form);
    }

    /**注册一堆表单 */
    registerAll(forms: SAPIProFormBatchRegister) {
        for (let [name, form] of Object.entries(forms)) {
            this.forms.set(name, form);
        }
    }

    /**获取指定名字的form
     * @returns
     * @throws 如果没有找到
     */
    getForm(name: string) {
        const form = this.forms.get(name);
        if (!form) throw new FormNotFoundError(`无法打开表单：未找到名字是:${name}的表单`, name);
        return form;
    }

    /**延迟显示form
     * @internal
     */
    _showDelay(player: Player, delay = 0) {
        //任何一条展示表单的路径（open/具名/跳转）都会经过这里，借此按需启用 min 清理
        this.ensureMinTick();
        const stack = formStackManager.getStack(player);
        if (!stack) return;
        //代际令牌：同一玩家只允许最后一次调度生效，丢弃之前排队的旧任务
        const generation = stack.bumpGeneration();
        const show = () => {
            if (formStackManager.getStack(player) !== stack) return;
            if (stack.navGeneration !== generation) return;
            void this._show(player);
        };
        // 必须等至少一个游戏刻：玩家关闭旧表单后，客户端还需要时间结算，
        // 立即 show() 下一张会被引擎拒绝（表现为“点按钮没反应”）。
        system.runTimeout(show, delay);
    }

    /** 诊断：尚未结算的 show 次数；长时间不归零说明某次 show 没有走完 */
    private pendingShows = 0;
    private completedShows = 0;

    /** @internal 诊断用 */
    dduiShowStats() {
        return { pendingShows: this.pendingShows, completedShows: this.completedShows };
    }

    /**显示form
     * @internal 不要调用
     */
    async _show(player: Player) {
        this.pendingShows++;
        try {
            await this._showInner(player);
        } finally {
            this.pendingShows--;
            this.completedShows++;
        }
    }

    private async _showInner(player: Player) {
        const stack = formStackManager.getStack(player);
        const context = stack?.getTop();
        const form = context?._form;
        if (!stack || !context || !form) return;
        if (!player.isValid) {
            disposeDDUISession(context);
            formStackManager.resetStack(player);
            return;
        }

        const generation = stack.navGeneration;
        /** 本次展示是否仍然是当前导航（旧 show 不能操作新栈） */
        const isCurrent = () => formStackManager.getStack(player) === stack && stack.navGeneration === generation;

        context._willBuild = true;

        // DDUI 页面：用 Promise 回调完成构建/显示/释放。
        // 不走下面的 async/await 链——`await show()` 期间帧会一直持有
        // context / form / builtForm，反复开关时表现为每次约 1KB 的残留。
        if (form._ddui === true) {
            showDDUIContext(
                player,
                context as SAPIProFormContext<CustomForm, contextArgs>,
                isCurrent,
                () => {
                    if (isCurrent()) this._handleShow(context);
                }
            );
            return;
        }

        if (form.beforeBuild) {
            try {
                await form.beforeBuild(context);
            } catch (e) {
                LibErrorMes("表单 beforeBuild 异常", e);
            }
        }
        if (!isCurrent()) return;

        //如果不build了就返回
        if (!context._willBuild) {
            this._handleShow(context);
            return;
        }

        let builtForm: formDataType;
        try {
            builtForm = await form.builder(player, context.args, context);
        } catch (e) {
            LibErrorMes("构建表单失败", e);
            disposeDDUISession(context);
            if (formStackManager.getTop(player) === context) stack.pop();
            return;
        }

        if (!isCurrent()) {
            // 展示前栈已被新的导航替换：释放刚构建的页面资源，绝不显示旧页面
            disposeDDUISession(context);
            return;
        }

        // 构建过程中页面主动关闭/重定向：不再显示这个表单
        if (!context._willBuild) {
            disposeDDUISession(context);
            if (isCurrent()) this._handleShow(context);
            return;
        }

        // 到这里只剩传统表单（DDUI 页面在上面已提前返回）
        this.showingLegacy.add(player.id);        let response: unknown;
        try {
            response = await (builtForm as unknown as { show(player: Player): Promise<unknown> }).show(player);
        } catch (e) {
            if (!isBenignShowError(e)) LibErrorMes("展示表单异常", e);
            disposeDDUISession(context);
            if (isCurrent()) this._handleShow(context);
            return;
        } finally {
            // 旧表单 show() 可能晚于新表单结算；不能删除新表单的 showing 标记。
            if (isCurrent()) this.showingLegacy.delete(player.id);
        }

        if (!isCurrent()) {
            disposeDDUISession(context);
            return;
        }

        try {
            await form.handler(response as never, context);
        } catch (e) {
            LibErrorMes("表单处理异常", e);
        }

        if (!isCurrent()) return;

        // 顶层关闭：与 DDUI 一致，换一条空栈释放全部上下文。
        // 页面跳转（_showData 已设置）时保留，返回时还要用 args。
        if (!context._showData) {
            formStackManager.resetStack(player);
        }

        this._handleShow(context);
    }

    _handleShow(context: SAPIProFormContext<formDataType, any>) {
        const showData = context._showData;
        if (!showData) return;
        if (showData.name) {
            this._showNamed(context.player, showData.name, showData.delay ?? 0);
        } else {
            this._showDelay(context.player, showData.delay);
        }
        context._showData = undefined;
    }
    /**显示具名form
     * @internal 不要调用
     */
    _showNamed(player: Player, name: string, delay = 0) {
        try {
            const context = formStackManager.getTop(player);
            if (!context) return;
            const form = this.getForm(name);
            context._form = form as any;
            this._showDelay(player, delay);
        } catch (err) {
            LibErrorMes("展示具名表单错误", err);
        }
    }
    /**
     * 为玩家打开表单
     * @param player 玩家
     * @param form 表单实例
     * @param args 初始参数
     * @param delay 延迟(游戏刻)
     */
    open<T extends formDataType, TArgs extends contextArgs>(
        player: Player,
        form: SAPIProForm<T, TArgs>,
        args?: NoInfer<TArgs>,
        delay = 0
    ) {
        if (!player.isValid) return;
        //同一玩家只能有一个界面：先关掉仍在显示的表单，避免新旧表单互相抢 UI
        const closed = this.closeCurrent(player);
        const stack = formStackManager.resetStack(player);
        stack.push(args ?? {}, form as any);
        this._showDelay(player, closed ? Math.max(delay, DDUI_SETTLE_TICKS) : delay);
    }

    /**
     * 关闭该玩家当前界面并清空表单栈（DDUI 与传统表单都适用）。
     * 运行时的对象销毁、玩家退出等场景直接调用即可。
     */
    close(player: Player) {
        closeDDUIPage(player);
        formStackManager.resetStack(player);
        this.showingLegacy.delete(player.id);
        closeAllForms(player);
    }

    /** 该玩家当前是否有表单在显示（不区分 DDUI / 传统表单） */
    isShowing(player: Player) {
        return this.showingLegacy.has(player.id) || activeDDUISession(player) !== undefined;
    }

    /** 关闭仍在前台的表单，返回是否真的关了东西 */
    private closeCurrent(player: Player) {
        if (closeDDUIPage(player)) return true;
        if (!this.showingLegacy.delete(player.id)) return false;
        closeAllForms(player);
        return true;
    }

    /**打开指定名字的表单，需要先注册
     * @param player 玩家
     * @param name 表单名
     * @param args 初始参数
     * @param delay 延迟(游戏刻)
     */
    openNamed(player: Player, name: string, args?: contextArgs, delay = 0) {
        try {
            const form = this.getForm(name);
            this.open(player, form, args, delay);
        } catch (err) {
            LibErrorMes("打开指定名字的表单错误", err);
        }
    }

    /**打开外部表单
     * @param player 玩家
     * @param nameSpace 包命名空间
     * @param name 表单名
     * @param args 初始参数
     * @param delay 延迟(游戏刻)
     */
    openExternal(player: Player, nameSpace: string, name: string, args?: contextArgs, delay = 0) {
        const data: openFormData = {
            name: name,
            nameSpace: nameSpace,
            playerid: player.id,
            args: args,
            delay: delay,
        };
        system.sendScriptEvent("form:open", JSON.stringify(data));
    }

    private listen(t: ScriptEventCommandMessageAfterEvent) {
        try {
            const data = JSON.parse(t.message) as openFormData;
            if (data.nameSpace != LibConfig.packInfo.nameSpace) return;
            const player = getPlayerById(data.playerid);
            if (player) {
                this.openNamed(player, data.name, data.args, data.delay);
            }
        } catch (e) {
            LibErrorMes("外部打开表单失败", e);
        }
    }
}

export const formManager = new FormManagerClass();
