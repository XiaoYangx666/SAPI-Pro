import { Player } from "@minecraft/server";
import { ActionFormData, ActionFormResponse } from "@minecraft/server-ui";
import { translator } from "../../Translate";
import { SAPIProForm, SAPIProFormContext } from "../form";
import { contextArgs } from "../interface";
import { formGenerator, TextType } from "./commonFormInterface";

export class BodyInfoForm<U extends contextArgs> implements SAPIProForm<ActionFormData, U> {
    private title: TextType;
    private body: formGenerator<ActionFormData, U> | TextType;
    private onSubmit?: (ctx: SAPIProFormContext<ActionFormData, U>) => void;

    constructor(
        title: TextType,
        body: formGenerator<ActionFormData, U> | TextType,
        onSubmit?: (ctx: SAPIProFormContext<ActionFormData, U>) => void
    ) {
        this.title = title;
        this.body = body;
        this.onSubmit = onSubmit;
    }

    async builder(player: Player, args: U): Promise<ActionFormData> {
        const t = translator.createUniversal(player);
        const form = new ActionFormData().title(t(this.title)).button({ translate: "gui.confirm" });
        if (typeof this.body == "function") {
            await this.body(form, player, args, t);
        } else {
            form.body(t(this.body));
        }
        return form;
    }

    async handler(res: ActionFormResponse, ctx: SAPIProFormContext<ActionFormData, U>) {
        if (res.canceled) return ctx.back();
        this.onSubmit?.(ctx);
        ctx.back();
    }
}
