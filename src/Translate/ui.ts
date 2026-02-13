import { ModalFormData } from "@minecraft/server-ui";
import { SAPIProForm } from "../main";
import { languageNames } from "./languages";
import { defineLangTree, translator } from "./translator";

export const LangUIText = defineLangTree({
    title: {
        zh_CN: "语言设置",
        zh_TW: "語言設定",
        en_US: "Language Settings",
        ja_JP: "言語設定",
        fr_FR: "Paramètres de langue",
        de_DE: "Spracheinstellungen",
        es_ES: "Configuración de idioma",
        ko_KR: "언어 설정",
    },

    dropdown_label: {
        zh_CN: "选择语言",
        zh_TW: "選擇語言",
        en_US: "Select Language",
        ja_JP: "言語を選択",
        fr_FR: "Choisir la langue",
        de_DE: "Sprache auswählen",
        es_ES: "Seleccionar idioma",
        ko_KR: "언어 선택",
    },

    confirm: {
        zh_CN: "确认",
        zh_TW: "確認",
        en_US: "Confirm",
        ja_JP: "確認",
        fr_FR: "Confirmer",
        de_DE: "Bestätigen",
        es_ES: "Confirmar",
        ko_KR: "확인",
    },
    setSuccess: {
        zh_CN: "语言设置成功",
        zh_TW: "語言設定成功",
        en_US: "Language setting updated successfully",
        ja_JP: "言語設定が正常に更新されました",
        fr_FR: "La langue a été définie avec succès",
        de_DE: "Sprache erfolgreich geändert",
        es_ES: "Idioma configurado correctamente",
        ko_KR: "언어 설정이 완료되었습니다",
    },

    setFailed: {
        zh_CN: "语言设置失败",
        zh_TW: "語言設定失敗",
        en_US: "Failed to update language settings",
        ja_JP: "言語設定の変更に失敗しました",
        fr_FR: "Échec de la modification de la langue",
        de_DE: "Sprache konnte nicht geändert werden",
        es_ES: "Error al configurar el idioma",
        ko_KR: "언어 설정에 실패했습니다",
    },
});

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
            .title(t("语言设置", LangUIText.title))
            .dropdown(t("选择语言", LangUIText.dropdown_label), enabledLanguages, {
                defaultValueIndex: curIndex,
            })
            .submitButton(t("确认", LangUIText.confirm));
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
