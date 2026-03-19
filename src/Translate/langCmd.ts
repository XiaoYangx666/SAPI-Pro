import { Command, CommandObject, pcommand } from "../Command/main";
import { formManager } from "../Form/formManager";
import { languageNames } from "./languages";
import { langCmdText } from "./ui_lang";
import { translator } from "./translator";
import { LangSettingForm } from "./ui";

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
