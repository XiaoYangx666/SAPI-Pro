import { ActionFormData, ActionFormResponse, MessageFormData } from "@minecraft/server-ui";
import {
    ButtonFormData,
    ButtonListFormData,
    FuncButton,
    SimpleMessageFormData,
    formGenerator,
} from "./commonFormInterface";
import { SAPIProForm } from "./form";
export class CommonForm {
    /**常用的按钮表单 */
    static ButtonForm(data: ButtonFormData) {
        const form: SAPIProForm<ActionFormData> = {
            builder: async (p, args) => {
                const form = new ActionFormData();
                if (data.title) form.title(data.title);
                if (data.body) form.body(data.body);
                if (data.generator) await data.generator(form, p, args);
                const generatedButtons = data.buttonGenerator ? data.buttonGenerator(p, args) : {};
                let buttons = Object.assign({}, data.buttons ?? {});
                Object.assign(buttons, generatedButtons);
                Object.entries(buttons).forEach(([label, button]) => {
                    const iconPath = button.icon ? `textures/${button.icon}` : undefined;
                    form.button(label, iconPath);
                });
                args.buttons = buttons;
                return form;
            },
            handler: (res, context) => {
                const p = context.player;
                const buttons = context.args.buttons as Record<string, FuncButton>;
                if (res.selection != undefined) {
                    return Object.values(buttons ?? {})[res.selection].func(context);
                } else {
                    return data.oncancel ? data.oncancel(res, context) : undefined;
                }
            },
            beforeBuild: data.validator,
        };
        return form;
    }
    /** 按钮列表表单*/
    static ButtonListForm(data: ButtonListFormData) {
        const form: SAPIProForm<ActionFormData> = {
            builder: async (p, args) => {
                const form = new ActionFormData();
                if (data.title) form.title(data.title);
                if (data.body) form.body(data.body);
                if (data.generator) {
                    await data.generator(form, p, args);
                }
                return form;
            },
            handler: (res: ActionFormResponse, ctx) => {
                if (res.selection != undefined) {
                    return data.handler(res.selection, ctx);
                } else {
                    return data.oncancel ? data.oncancel(res, ctx) : undefined;
                }
            },
            beforeBuild: data.validator,
        };
        return form;
    }
    /**
     * 一个简单的提示窗口，仅含有两个按钮，
     */
    static SimpleMessageForm(data: SimpleMessageFormData) {
        const form: SAPIProForm<MessageFormData> = {
            builder: async (p, args) => {
                const form = new MessageFormData();
                if (data.title) form.title(data.title);
                if (data.body) form.body(data.body);
                if (data.button1) form.button1(data.button1);
                if (data.button2) form.button2(data.button2);
                if (data.generator) await data.generator(form, p, args);
                return form;
            },
            handler: data.handler,
        };
        return form;
    }
    /**
     * 注册一个简单的信息窗口
     * @param title 标题
     * @param body 内容，可以是生成器
     */
    static BodyInfoForm(title: string, body: formGenerator<ActionFormData> | string) {
        const form: SAPIProForm<ActionFormData> = {
            builder: async (p, args) => {
                const form = new ActionFormData().title(title).button("确定");
                if (typeof body == "string") {
                    form.body(body);
                } else {
                    await body(form, p, args);
                }
                return form;
            },
            handler: (res: ActionFormResponse, context) => {
                if (res.canceled) return undefined;
                context.back();
            },
        };
        return form;
    }
}
