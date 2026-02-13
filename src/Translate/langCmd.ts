import { Player } from "@minecraft/server";
import { Command, CommandObject, pcommand } from "../Command/main";
import { formManager } from "../Form/formManager";
import { languageNames } from "./languages";
import { defineLangTree, translator } from "./translator";
import { LangSettingForm, LangUIText } from "./ui";

const langCmdText = defineLangTree({
    curLangMsg: {
        zh_CN: "当前语言是: {lang}",
        zh_TW: "目前語言為：{lang}",
        en_US: "Current language is: {lang}",
        ja_JP: "現在の言語は：{lang}",
        fr_FR: "La langue actuelle est : {lang}",
        de_DE: "Aktuelle Sprache: {lang}",
        ko_KR: "현재 언어: {lang}",
        es_ES: "El idioma actual es: {lang}",
    },
    resetMsg: {
        zh_CN: "已重置您的语言设置",
        zh_TW: "已重置您的語言設定",
        en_US: "Your language settings have been reset",
        ja_JP: "言語設定をリセットしました",
        fr_FR: "Vos paramètres de langue ont été réinitialisés",
        de_DE: "Ihre Spracheinstellungen wurden zurückgesetzt",
        ko_KR: "언어 설정이 초기화되었습니다",
        es_ES: "La configuración de idioma ha sido restablecida",
    },
    listMsg: {
        zh_CN: "可用语言列表",
        zh_TW: "可用語言列表",
        en_US: "Available languages",
        ja_JP: "利用可能な言語一覧",
        fr_FR: "Langues disponibles",
        de_DE: "Verfügbare Sprachen",
        ko_KR: "사용 가능한 언어 목록",
        es_ES: "Idiomas disponibles",
    },

    setSuccess: LangUIText.setSuccess,
    setFailed: LangUIText.setFailed,
});

const langCmd: CommandObject = {
    name: "lang",
    explain: "open language setting form",
    handler: (p) => {
        formManager.open(p, LangSettingForm);
    },
    subCommands: [
        {
            name: "cur",
            explain: "print cur language",
            handler: (p) => {
                const t = translator.createFor(p);
                const langId = translator.getPlayerLangId(p);
                const langName =
                    langId != undefined
                        ? Object.values(languageNames)[langId]
                        : languageNames[translator.fallBackLang];
                p.sendMessage(t("当前语言是:{lang}", langCmdText.curLangMsg, { lang: langName }));
            },
        },
        {
            name: "reset",
            explain: "reset language",
            handler: (p) => {
                const t = translator.createFor(p);
                translator.resetPlayerLang(p);
                p.sendMessage(t("已重置您的语言设置", langCmdText.resetMsg));
            },
        },
        {
            name: "list",
            explain: "show language list",
            handler: (p) => {
                const t = translator.createFor(p);
                const names = translator.enabledLanguages.map((t) => t + ":" + languageNames[t]);
                p.sendMessage(t("可用语言列表", langCmdText.listMsg));
                names.forEach((lang) => p.sendMessage(lang));
            },
        },
        {
            name: "set",
            explain: "set language",
            paramBranches: [{ name: "lang", type: "enum", enums: Object.keys(languageNames) }],
            handler: (p, parm) => {
                const id = translator.getLangIdByKey(parm.lang);
                if (id == undefined) return;
                try {
                    translator.setPlayerLang(p, id);
                    const t = translator.createPureFor(p);
                    p.sendMessage(t(langCmdText.setSuccess));
                } catch (err) {
                    const t = translator.createPureFor(p);
                    p.sendMessage(t(langCmdText.setFailed));
                }
            },
        },
    ],
};

pcommand.registerCommand(Command.fromObject(langCmd));
