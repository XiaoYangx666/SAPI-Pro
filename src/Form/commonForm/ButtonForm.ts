import { Player } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";
import { translator, UniversalTranslator } from "../../Translate";
import { SAPIProForm, SAPIProFormContext } from "../form";
import { ButtonFormArgs, ButtonFormData, FuncButton } from "./commonFormInterface";

/**通用按钮表单 */
export class ButtonForm<U extends ButtonFormArgs> implements SAPIProForm<ActionFormData, U> {
    private data: ButtonFormData<U>;

    constructor(data: ButtonFormData<U>) {
        this.data = data;
    }

    async beforeBuild(ctx: SAPIProFormContext<ActionFormData, U>) {
        if (!this.data.validator) return;
        return this.data.validator(ctx);
    }

    async builder(player: Player, args: U): Promise<ActionFormData> {
        const form = new ActionFormData();
        const t = translator.createUniversal(player);

        this.buildHeader(form, t);
        await this.runCustomGenerator(form, player, args, t);

        const buttons = this.collectButtons(player, args, t);

        this.renderButtons(form, buttons, player, args, t);

        // 注入给 handler 使用
        args.buttons = buttons;

        return form;
    }

    async handler(res: ActionFormResponse, context: SAPIProFormContext<ActionFormData, U>) {
        const buttons = context.args.buttons as FuncButton<U>[];

        if (res.selection !== undefined) {
            const button = buttons[res.selection];
            if (!button) return;
            //执行按钮的func
            if (button.func) {
                await button.func?.(context);
                return;
            }
            //执行列表处理函数
            await this.data.handler?.(context, res.selection);
        }

        if (this.data.oncancel) {
            await this.data.oncancel(res, context);
        }
    }

    private buildHeader(form: ActionFormData, t: UniversalTranslator) {
        if (this.data.title) form.title(t(this.data.title));
        if (this.data.body) form.body(t(this.data.body));
    }

    private async runCustomGenerator(
        form: ActionFormData,
        player: Player,
        args: U,
        t: UniversalTranslator
    ) {
        if (!this.data.generator) return;
        await this.data.generator(form, player, args, t);
    }

    private collectButtons(player: Player, args: U, t: UniversalTranslator): FuncButton<U>[] {
        const result: FuncButton<U>[] = [];

        // 静态按钮
        if (this.data.buttons) {
            result.push(...this.data.buttons);
        }

        // 动态按钮
        const gen = this.data.buttonGenerator?.(player, args, t);

        if (gen) {
            result.push(...gen);
        }

        return result;
    }

    private renderButtons(
        form: ActionFormData,
        buttons: FuncButton<U>[],
        player: Player,
        args: U,
        t: UniversalTranslator
    ) {
        for (const button of buttons) {
            //检查权限
            if (button.permission && button.permission !== player.playerPermissionLevel) continue;
            //检查自定义隐藏函数
            if (!(button.shouldShow?.(player, args) ?? true)) continue;

            const iconPath = button.icon ? `textures/${button.icon}` : undefined;

            form.button(t(button.label), iconPath);
        }
    }
}
