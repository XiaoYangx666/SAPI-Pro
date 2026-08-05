import { ModalFormData } from "@minecraft/server-ui";
import { SAPIProForm } from "../Form/form";
import { languageNames } from "./languages";
import { translator } from "./translator";
import { LangUIText } from "./ui_lang";

/**语言设置表单 */
export const LangSettingForm: SAPIProForm<ModalFormData> = {
    builder(player, args) {
        const t = translator.createFor(player);
        const LangId = translator.getPlayerLangId(player);

        const names = Object.values(languageNames);
        const cur = LangId != undefined ? names[LangId] : translator.fallBackLang;

        const enabledLanguages = translator.enabledLanguages
            .map((t) => languageNames[t])
            .filter((t) => t != undefined);
        const curIndexRaw = enabledLanguages.indexOf(cur);
        const curIndex = curIndexRaw >= 0 ? curIndexRaw : 0;
        //构建
        const form = new ModalFormData()
            .title({ translate: "options.language" })
            .dropdown(t("选择语言", LangUIText.dropdown_label), enabledLanguages, {
                defaultValueIndex: curIndex,
            })
            .submitButton({ translate: "gui.confirm" });
        return form;
    },
    handler(response, context) {
        const player = context.player;
        const sel = response.formValues?.[0];
        if (sel == undefined || typeof sel != "number") {
            return;
        }
        const keys = Object.keys(languageNames);
        const originIndex = Math.max(keys.indexOf(translator.enabledLanguages[sel]), 0);

        try {
            translator.setPlayerLang(context.player, originIndex);
            const t = translator.createFor(player);
            player.sendMessage("§a" + t("语言设置成功", LangUIText.setSuccess));
        } catch (err) {
            const t = translator.createFor(player);
            player.sendMessage("§c" + t("语言设置失败", LangUIText.setFailed));
        }
        context.back();
    },
};
