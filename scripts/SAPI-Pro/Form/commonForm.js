import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { FormManager, NavType } from "./main";
export class CommonForm {
    /**常用的按钮表单 */
    static ButtonForm(id, data) {
        const form = {
            id: id,
            builder: async (p, context) => {
                const form = new ActionFormData();
                if (data.title)
                    form.title(data.title);
                if (data.body)
                    form.body(data.body);
                if (data.generator)
                    data.generator(form, p, context);
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
            handler: (p, res, context) => {
                const buttons = context.buttons;
                if (res.selection != undefined) {
                    return Object.values(buttons ?? {})[res.selection].func(p, context);
                }
                else {
                    return data.oncancel ? data.oncancel(p, res, context) : undefined;
                }
            },
            validator: data.validator,
        };
        FormManager.register(form);
    }
    /** 按钮列表表单*/
    static ButtonListForm(id, data) {
        const form = {
            id: id,
            builder: async (p, context) => {
                const form = new ActionFormData();
                if (data.title)
                    form.title(data.title);
                if (data.body)
                    form.body(data.body);
                if (data.generator) {
                    data.generator(form, p, context);
                }
                return form;
            },
            handler: (p, res, ctx) => {
                if (res.selection != undefined) {
                    return data.handler(p, res.selection, ctx);
                }
                else {
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
    static SimpleMessageForm(id, data) {
        const form = {
            id: id,
            builder: async (p, context) => {
                const form = new MessageFormData();
                if (data.title)
                    form.title(data.title);
                if (data.body)
                    form.body(data.body);
                if (data.button1)
                    form.button1(data.button1);
                if (data.button2)
                    form.button2(data.button2);
                if (data.generator)
                    data.generator(form, p, context);
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
    static BodyInfoForm(id, title, body) {
        FormManager.register({
            id: id,
            builder: async (player, context) => {
                const form = new ActionFormData().title(title).button("确定");
                if (typeof body == "string") {
                    form.body(body);
                }
                else {
                    body(form, player, context);
                }
                return form;
            },
            handler: (player, res, context) => {
                if (res.canceled)
                    return undefined;
                return { type: NavType.BACK };
            },
        });
    }
}
