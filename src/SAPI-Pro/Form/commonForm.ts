import { Player } from "@minecraft/server";
import { ActionFormData, ActionFormResponse, MessageFormData } from "@minecraft/server-ui";
import { context, FormData, FormHandler, FormManager, FormValidator, NavigationCommand, NavType } from "./main";
export class CommonForm {
    /**常用的按钮表单 */
    static ButtonForm(id: string, data: ButtonFormData) {
        const form: FormData = {
            id: id,
            builder: async (p, context) => {
                const form = new ActionFormData();
                if (data.title) form.title(data.title);
                if (data.body) form.body(data.body);
                if (data.generator) data.generator(form, p, context);
                const generatedButtons = data.buttonGenerator ? data.buttonGenerator(p, context) : {};
                let buttons = Object.assign({}, data.buttons ?? {});
                Object.assign(buttons, generatedButtons);
                Object.entries(buttons).forEach(([label, button]) => {
                    const iconPath = button.icon ? `textures/${button.icon}` : undefined;
                    form.button(label, iconPath);
                });
                context.buttons = buttons;
                return form;
            },
            handler: (p, res: ActionFormResponse, context) => {
                const buttons = context.buttons as Record<string, FuncButton>;
                if (res.selection != undefined) {
                    return Object.values(buttons ?? {})[res.selection].func(p, context);
                } else {
                    return data.oncancel ? data.oncancel(p, res, context) : undefined;
                }
            },
            validator: data.validator,
        };
        FormManager.register(form);
    }
    /** 按钮列表表单*/
    static ButtonListForm(id: string, data: ButtonListFormData) {
        const form: FormData = {
            id: id,
            builder: async (p, context) => {
                const form = new ActionFormData();
                if (data.title) form.title(data.title);
                if (data.body) form.body(data.body);
                if (data.generator) {
                    data.generator(form, p, context);
                }
                return form;
            },
            handler: (p, res: ActionFormResponse, ctx) => {
                if (res.selection != undefined) {
                    return data.handler(p, res.selection, ctx);
                } else {
                    return data.oncancel ? data.oncancel(p, res, ctx) : undefined;
                }
            },
            validator: data.validator,
        };
        FormManager.register(form);
    }
    /**
     * 一个简单的提示窗口，仅含有两个按钮，
     */
    static SimpleMessageForm(id: string, data: SimpleMessageFormData) {
        const form: FormData = {
            id: id,
            builder: async (p, context) => {
                const form = new MessageFormData();
                if (data.title) form.title(data.title);
                if (data.body) form.body(data.body);
                if (data.button1) form.button1(data.button1);
                if (data.button2) form.button2(data.button2);
                if (data.generator) data.generator(form, p, context);
                return form;
            },
            handler: data.handler,
        };
        FormManager.register(form);
    }
    /**
     * 注册一个简单的信息窗口
     * @param title 标题
     * @param body 内容，可以是生成器
     */
    static BodyInfoForm(id: string, title: string, body: formGenerator<ActionFormData> | string) {
        FormManager.register({
            id: id,
            builder: async (player, context) => {
                const form = new ActionFormData().title(title).button("确定");
                if (typeof body == "string") {
                    form.body(body);
                } else {
                    body(form, player, context);
                }
                return form;
            },
            handler: (player, res: ActionFormResponse, context) => {
                if (res.canceled) return undefined;
                return { type: NavType.BACK };
            },
        });
    }
}

export interface FuncButton {
    /**图标路径，从textures/后面开始输 */
    icon?: string;
    /**按钮点击事件 */
    func: (player: Player, context: context) => Promise<NavigationCommand | undefined> | NavigationCommand | undefined;
}
export interface formGenerator<T> {
    /**自定义表单生成器，不要和原本的冲突了 */
    (form: T, player: Player, context: context): void;
}
export interface buttonGenerator {
    /**按钮生成器，用于自定义按钮 */
    (player: Player, context: context): Record<string, FuncButton> | undefined;
}
export interface ButtonFormData {
    title?: string;
    body?: string;
    /**按钮对象 */
    buttons?: Record<string, FuncButton>;
    /**按钮生成器 */
    buttonGenerator?: buttonGenerator;
    /**取消事件 */
    oncancel?: FormHandler;
    /**自定义生成器，如果只需要按钮可以用按钮生成器 */
    generator?: formGenerator<ActionFormData>;
    /**表单验证器，验证失败则不打开表单 */
    validator?: FormValidator;
}

export interface ListFormHandler {
    (player: Player, selection: number, context: context): Promise<NavigationCommand | undefined> | NavigationCommand | undefined;
}

export interface ButtonListFormData {
    title?: string;
    body?: string;
    generator?: formGenerator<ActionFormData>;
    handler: ListFormHandler;
    oncancel?: FormHandler;
    validator?: FormValidator;
}

export interface SimpleMessageFormData {
    title?: string;
    body?: string;
    generator?: (form: MessageFormData, player: Player, context: context) => void;
    button1?: string;
    button2?: string;
    handler: FormHandler;
}
