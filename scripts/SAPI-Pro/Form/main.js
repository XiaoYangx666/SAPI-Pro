import { system } from "@minecraft/server";
import { intervalBus, ScriptEventBus } from "SAPI-Pro/Event";
import { getAllPlayers, getPlayerById } from "SAPI-Pro/func";
class FormContextManager {
    static getStack(player) {
        return this.playerDataMap.get(player.id);
    }
    static resetStack(player) {
        this.playerDataMap.set(player.id, []);
        return this.playerDataMap.get(player.id);
    }
    static push(player, context) {
        let stack = this.getStack(player) ?? this.resetStack(player);
        stack.push(context);
    }
    static pop(player) {
        const stack = this.getStack(player);
        if (stack && stack.length > 0) {
            return stack.pop();
        }
    }
    /**获取top元素 */
    static getTop(player) {
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
FormContextManager.playerDataMap = new Map();
intervalBus.subscribemin(() => FormContextManager.clearOff());
export var NavType;
(function (NavType) {
    /** 打开新页面*/
    NavType[NavType["OPEN_NEW"] = 0] = "OPEN_NEW";
    /**返回上一页 */
    NavType[NavType["BACK"] = 1] = "BACK";
    /**刷新当前页面 */
    NavType[NavType["REOPEN"] = 2] = "REOPEN";
    /** 关闭所有*/
    NavType[NavType["CLOSE"] = 3] = "CLOSE";
    /**重置并打开新页面 */
    NavType[NavType["RESET_OPEN"] = 4] = "RESET_OPEN";
    /**替换当前页面 */
    NavType[NavType["REPLACE"] = 5] = "REPLACE";
})(NavType || (NavType = {}));
const NavOpe = {
    [NavType.OPEN_NEW]: (player, command) => {
        if (command.formId == undefined)
            return false;
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
            name: command.formId,
            data: command.contextData ?? {},
        });
        return true;
    },
};
export class FormManager {
    /**注册一个表单 */
    static register(formData) {
        this.forms.set(formData.id, formData);
    }
    /**注册一堆表单 */
    static registerAll(formDatas) {
        for (let data of formDatas) {
            this.forms.set(data.id, data);
        }
    }
    static getForm(id) {
        return this.forms.get(id);
    }
    static async showForm(player, formId, contextData) {
        const formData = this.getForm(formId);
        if (!formData)
            throw new Error(`Form ${formId} not registered`);
        const currentContext = FormContextManager.getTop(player);
        if (formData.validator) {
            const validation = formData.validator(player, currentContext?.data ?? {});
            if (validation != true) {
                this.handleNavigation(player, validation === false ? undefined : validation);
                return;
            }
        }
        const form = await formData.builder(player, currentContext?.data ?? {});
        form.show(player).then(async (response) => {
            const command = await formData.handler(player, response, currentContext?.data || {});
            this.handleNavigation(player, command);
        });
    }
    static handleNavigation(player, command) {
        if (command == undefined || command == null) {
            command = { type: NavType.CLOSE };
        }
        if (command.contextData == undefined)
            command.contextData = {};
        const ope = NavOpe[command.type](player, command);
        if (ope) {
            this.showForm(player, command.formId, command.contextData);
        }
    }
    /**
     * 为玩家打开指定ID的表单
     * 需要先注册表单
     */
    static open(player, formId, initialData, delay = 0, isfirst = true) {
        if (!FormManager.forms.has(formId)) {
            //prettier-ignore
            if (isfirst)
                system.run(() => {
                    system.scriptEvent("form:open", JSON.stringify({ id: formId, playerid: player.id, initialData: initialData, delay: delay }));
                });
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
FormManager.forms = new Map();
//清理不在线的人的上下文
intervalBus.subscribemin(() => {
    FormContextManager.clearOff();
});
ScriptEventBus.bind("form:open", (t) => {
    try {
        const data = JSON.parse(t.message);
        const player = getPlayerById(data.playerid);
        if (player) {
            FormManager.open(player, data.id, data.initialData, data.delay, false);
        }
    }
    catch (e) { }
});
