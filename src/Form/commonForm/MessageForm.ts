import { Player } from "@minecraft/server";
import { MessageFormData, MessageFormResponse } from "@minecraft/server-ui";
import { translator, UniversalTranslator } from "../../Translate";
import { SAPIProForm, SAPIProFormContext } from "../form";
import { contextArgs } from "../interface";
import { SimpleMessageFormData } from "./commonFormInterface";

export class SimpleMessageForm<U extends contextArgs> implements SAPIProForm<MessageFormData, U> {
    private data: SimpleMessageFormData<U>;

    constructor(data: SimpleMessageFormData<U>) {
        this.data = data;
    }

    async builder(player: Player, args: U): Promise<MessageFormData> {
        const form = new MessageFormData();
        const t = translator.createUniversal(player);

        this.buildHeader(form, t);
        this.buildButtons(form, t);
        await this.runGenerator(form, player, args, t);

        return form;
    }

    async handler(res: MessageFormResponse, ctx: SAPIProFormContext<MessageFormData, U>) {
        if (res.selection === undefined) return;

        if (res.selection === 0) {
            await this.data.button1?.func(ctx);
        } else if (res.selection === 1) {
            await this.data.button2?.func(ctx);
        }
    }

    private buildHeader(form: MessageFormData, t: UniversalTranslator) {
        if (this.data.title) form.title(t(this.data.title));
        if (this.data.body) form.body(t(this.data.body));
    }

    private buildButtons(form: MessageFormData, t: UniversalTranslator) {
        if (this.data.button1) form.button1(t(this.data.button1.text));

        if (this.data.button2) form.button2(t(this.data.button2.text));
    }

    private async runGenerator(
        form: MessageFormData,
        player: Player,
        args: U,
        t: UniversalTranslator
    ) {
        if (!this.data.generator) return;
        await this.data.generator(form, player, args, t);
    }
}
