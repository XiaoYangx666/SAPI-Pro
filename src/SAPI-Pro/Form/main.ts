import { Player, system } from "@minecraft/server";
import { ActionFormData, ActionFormResponse, MessageFormData, MessageFormResponse, ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { intervalBus, ScriptEventBus } from "SAPI-Pro/Event";
import { getAllPlayers, getPlayerById, LibError } from "SAPI-Pro/func";

export interface context {
    [key: string]: any;
}
export interface FormContext {
    name: string;
    data: context;
}
class FormContextManager {
    private static playerDataMap = new Map<string, FormContext[]>();
    static getStack(player: Player) {
        return this.playerDataMap.get(player.id);
    }
    static resetStack(player: Player) {
        this.playerDataMap.set(player.id, []);
        return this.playerDataMap.get(player.id) as FormContext[];
    }
    static push(player: Player, context: FormContext) {
        let stack = this.getStack(player) ?? this.resetStack(player);
        stack.push(context);
    }
    static pop(player: Player) {
        const stack = this.getStack(player);
        if (stack && stack.length > 0) {
            return stack.pop();
        }
    }
    /**获取top元素 */
    static getTop(player: Player) {
        const stack = this.getStack(player);
        if (stack && stack.length > 0) {
            return stack[stack.length - 1];
        }
    }
    /**清理掉线 */
    static clearOff() {
        const players = getAllPlayers().map((t) => t.id);
        for (let pid of this.playerDataMap.keys()) {
            if (!players.includes(pid)) {
                this.playerDataMap.delete(pid);
            }
        }
    }
}
intervalBus.subscribemin(() => FormContextManager.clearOff());
export interface FormBuiler {
    (player: Player, context: context): Promise<ActionFormData | ModalFormData | MessageFormData> | ActionFormData | ModalFormData | MessageFormData;
}

export interface FormHandler {
    /**
     * 表单处理函数
     * @param response 表单返回
     * @param context 表单上下文，可用于获取传值
     */
    (player: Player, response: ActionFormResponse | ModalFormResponse | MessageFormResponse, context: context):
        | Promise<NavigationCommand | undefined>
        | NavigationCommand
        | undefined
        | void;
}

export interface FormValidator {
    /**
     * 表单验证器，返回是否打开表单或自定义表单操作
     */
    (player: Player, context: context): boolean | NavigationCommand;
}

export interface FormData {
    /**表单的唯一ID */
    id: string;
    /**构建器 */
    builder: FormBuiler;
    /**表单处理器 */
    handler: FormHandler;
    /**表单验证器 */
    validator?: FormValidator;
}

export enum NavType {
    /** 打开新页面*/
    OPEN_NEW,
    /**返回上一页 */
    BACK,
    /**刷新当前页面 */
    REOPEN,
    /** 关闭所有*/
    CLOSE,
    /**重置并打开新页面 */
    RESET_OPEN,
    /**替换当前页面 */
    REPLACE,
}

export interface NavigationCommand {
    /** 导航操作类型*/
    type: NavType;
    /**表单id */
    formId?: string;
    /**上下文 */
    contextData?: any;
}

const NavOpe: Record<NavType, (player: Player, command: NavigationCommand) => boolean> = {
    [NavType.OPEN_NEW]: (player, command) => {
        if (command.formId == undefined) return false;
        FormContextManager.push(player, {
            name: command.formId,
            data: command.contextData ?? {},
        });
        return true;
    },
    [NavType.REOPEN]: (player, command) => {
        const context = FormContextManager.getTop(player);
        if (context != undefined) {
            command.formId = context.name;
            command.contextData = context.data;
            return true;
        }
        return false;
    },
    [NavType.REPLACE]: (player, command) => {
        const context = FormContextManager.getTop(player);
        if (context != undefined && command.formId) {
            context.name = command.formId;
            context.data = command.contextData;
            return true;
        }
        return false;
    },
    [NavType.BACK]: (player, command) => {
        FormContextManager.pop(player);
        const prevContext = FormContextManager.getTop(player);
        if (prevContext != undefined) {
            command.formId = prevContext.name;
            command.contextData = prevContext.data;
            return true;
        }
        return false;
    },
    [NavType.CLOSE]: (player, command) => {
        FormContextManager.resetStack(player);
        return false;
    },
    [NavType.RESET_OPEN]: (player, command) => {
        FormContextManager.resetStack(player);
        FormContextManager.push(player, {
            name: command.formId!,
            data: command.contextData ?? {},
        });
        return true;
    },
};

export class FormManager {
    private static forms = new Map<string, FormData>();
    /**注册一个表单 */
    static register(formData: FormData) {
        this.forms.set(formData.id, formData as FormData);
    }
    /**注册一堆表单 */
    static registerAll(formDatas: FormData[]) {
        for (let data of formDatas) {
            this.forms.set(data.id, data);
        }
    }
    private static getForm(id: string) {
        return this.forms.get(id);
    }

    private static async showForm(player: Player, formId: string, contextData?: any): Promise<void> {
        const formData = this.getForm(formId);
        if (!formData) return LibError(`Form ${formId} not registered`);
        const currentContext = FormContextManager.getTop(player);
        if (formData.validator) {
            const validation = formData.validator(player, currentContext?.data ?? {});
            if (validation != true) {
                this.handleNavigation(player, validation === false ? undefined : validation);
                return;
            }
        }
        const form = await formData.builder(player, currentContext?.data ?? {});
        form.show(player as any).then(async (response) => {
            const command = await formData.handler(player, response, currentContext?.data || {});
            this.handleNavigation(player, command);
        });
    }

    private static handleNavigation(player: Player, command: NavigationCommand | undefined | void) {
        if (command == undefined || command == null) {
            command = { type: NavType.CLOSE };
        }
        if (command.contextData == undefined) command.contextData = {};
        const ope = NavOpe[command.type](player, command);
        if (ope) {
            this.showForm(player, command.formId!, command.contextData);
        }
    }
    /**
     * 为玩家打开指定ID的表单
     * 需要先注册表单
     */
    static open(player: Player, formId: string, initialData?: any, delay = 0, isfirst = true) {
        if (!FormManager.forms.has(formId)) {
            //prettier-ignore
            if (isfirst) system.run(()=>{
                system.scriptEvent("form:open", JSON.stringify({ id: formId, playerid: player.id, initialData: initialData, delay: delay }));
            })
            return;
        }
        FormContextManager.resetStack(player);
        FormContextManager.push(player, {
            name: formId,
            data: initialData ?? {},
        });
        system.runTimeout(() => {
            this.showForm(player, formId, initialData);
        }, delay);
    }
}

//清理不在线的人的上下文
intervalBus.subscribemin(() => {
    FormContextManager.clearOff();
});
ScriptEventBus.bind("form:open", (t) => {
    try {
        const data = JSON.parse(t.message) as openFormData;
        const player = getPlayerById(data.playerid);
        if (player) {
            FormManager.open(player, data.id, data.initialData, data.delay, false);
        }
    } catch (e) {}
});

interface openFormData {
    id: string;
    playerid: string;
    initialData: object;
    delay: number;
}
