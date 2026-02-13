import { Player } from "@minecraft/server";
import { ScoreBoardDataBase } from "../DataBase";
import { Command, formManager, LangSettingForm, Logger, pcommand } from "../main";
import { LangText, LangTree, languages } from "./interface";
import { languageNames } from "./languages";

/**创建语言翻译结构 */
export function defineLangTree<T extends LangTree>(tree: T): T {
    return tree;
}

/**翻译器，用于翻译 */
class TranslationManager {
    private readonly langDB = new ScoreBoardDataBase("langDB");
    private readonly logger = new Logger("SAPI-Pro-" + TranslationManager.name);
    private _fallBackLang: languages = "zh_CN";
    private _enabledLanguages: languages[] = [
        "zh_CN",
        "zh_TW",
        "en_US",
        "ja_JP",
        "fr_FR",
        "de_DE",
        "ko_KR",
        "es_ES",
    ];

    get fallBackLang() {
        return this._fallBackLang;
    }

    get enabledLanguages() {
        return this._enabledLanguages;
    }
    /**设置回退语言 */
    setFallBack(lang: languages) {
        this._fallBackLang = lang;
    }

    /**设置启用的语言 */
    setEnabledLanguages(langs: languages[]) {
        this._enabledLanguages = langs.filter((t) => languageNames[t] != undefined);
    }

    /**
     * 设置指定玩家的语言
     * @throw 当格式错误时抛出错误
     */
    setPlayerLang(player: Player, langId: number) {
        const keys = Object.keys(languageNames);
        const availableIds = this.enabledLanguages
            .map((lang) => keys.indexOf(lang))
            .filter((t) => t >= 0);
        if (availableIds.includes(langId)) {
            this.langDB.set(player, langId);
        } else {
            this.logger.error("setPlayerLang失败,langId错误");
            throw new Error("setPlayerLang失败,langId错误");
        }
    }

    /**
     * 重置指定玩家的语言
     */
    resetPlayerLang(player: Player) {
        this.langDB.rm(player);
    }

    /**
     * 获取指定玩家当前语言
     */
    getPlayerLangId(player: Player) {
        const langId = this.langDB.get(player);
        return langId;
    }

    /**
     * 获取指定语言的翻译数据包
     */
    getLangKeyById(langId: number) {
        try {
            const langKey = Object.keys(languageNames)[langId] as languages;
            return langKey;
        } catch (err) {
            this.logger.error("getLangKey失败", err);
        }
    }

    /**根据语言key获取id */
    getLangIdByKey(langKey: string) {
        const id = Object.keys(languageNames).indexOf(langKey);
        return id == -1 ? undefined : id;
    }

    /**
     * 为指定玩家创建一个一次性翻译函数
     */
    createPureFor(
        player: Player
    ): (translation?: LangText, params?: Record<string, string | number>) => string {
        const langId = this.getPlayerLangId(player);
        const langKey = langId != undefined ? this.getLangKeyById(langId) : this._fallBackLang;

        return (translation?: LangText, params?: Record<string, string | number>) => {
            // 无语言 / 无翻译对象
            if (!langKey || !translation) {
                return "";
            }

            const trans = translation[langKey];

            // 当前语言无翻译
            if (!trans) {
                return "";
            }

            return this.applyParams(trans, params);
        };
    }

    /**
     * 为指定玩家创建一个一次性翻译函数，带语义锚点
     */
    createFor(
        player: Player
    ): (text: string, translation?: LangText, params?: Record<string, string | number>) => string {
        const langId = this.getPlayerLangId(player);
        const langKey = langId != undefined ? this.getLangKeyById(langId) : undefined;

        // 提前定义替换函数，避免重复代码

        return (text: string, translation?: LangText, params?: Record<string, string | number>) => {
            // 没语言 or 没翻译对象 → 用 text 作为模板
            if (!langKey || !translation) {
                return params ? this.applyParams(text, params) : text;
            }

            const trans = translation[langKey];

            // 当前语言无翻译 → 用 text
            if (!trans) {
                return this.applyParams(text, params);
            }

            // 正常翻译路径
            return this.applyParams(trans, params);
        };
    }

    private applyParams(tpl: string, params?: Record<string, string | number>) {
        if (!params) return tpl;

        return tpl.replace(/\{(\w+)\}/g, (match, key) => {
            if (params[key] !== undefined) {
                return String(params[key]);
            }
            return match;
        });
    }
}

/**翻译器 */
export const translator = new TranslationManager();
