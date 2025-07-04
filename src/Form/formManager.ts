import { Player, ScriptEventCommandMessageAfterEvent, system } from "@minecraft/server";
import { LibConfig } from "../Config";
import { ScriptEventBus, intervalBus } from "../Event";
import { LibErrorMes, getPlayerById } from "../func";
import { SAPIProForm } from "./form";
import { contextArgs, formDataType, openFormData } from "./interface";
import { formStackManager } from "./stackManager";

interface SAPIProFormBatchRegister {
    [key: string]: SAPIProForm<formDataType>;
}

class FormNotFoundError extends Error {
    formName: string;
    constructor(mes: string, name: string) {
        super(mes);
        this.formName = name;
    }
}

export class FormManagerClass {
    private forms = new Map<string, SAPIProForm<any>>();

    /**@internal 不要调用，不要调用，不要调用 */
    _bind() {
        ScriptEventBus.bind("form:open", this.listen.bind(this));
        intervalBus.subscribemin(() => {
            formStackManager.clearOff();
        });
    }

    /**注册一个具名表单 */
    registerNamed<T extends formDataType>(name: string, form: SAPIProForm<T>) {
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

    /**显示form
     * @internal 不要调用
     */
    _show(player: Player, delay = 0) {
        system.runTimeout(async () => {
            const context = formStackManager.getTop(player);
            if (!context?._form) return;
            const form = context._form;
            //重置
            context.willBuild = true;
            if (form.beforeBuild) {
                await form.beforeBuild(context);
            }
            //如果不build了就返回
            if (!context.willBuild) return;
            const buildForm = await form.builder(context.player, context.args);
            buildForm.show(player).then(async (response) => {
                form.handler(response, context);
            });
        }, delay);
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
            this._show(player, delay);
        } catch (err) {
            if (err instanceof Error) LibErrorMes(err.message);
        }
    }
    /**
     * 为玩家打开表单
     * @param player 玩家
     * @param form 表单实例
     * @param args 初始参数
     * @param delay 延迟(游戏刻)
     */
    open<T extends formDataType>(player: Player, form: SAPIProForm<T>, args?: contextArgs, delay = 0) {
        const stack = formStackManager.resetStack(player);
        stack.push(args ?? {}, form as any);
        this._show(player, delay);
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
            if (err instanceof Error) {
                LibErrorMes(err.message);
            }
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
        const data: openFormData = { name: name, nameSpace: nameSpace, playerid: player.id, args: args, delay: delay };
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
            if (e instanceof Error) {
                LibErrorMes(e.message + e.stack);
            }
        }
    }
}

export const formManager = new FormManagerClass();
formManager._bind();
