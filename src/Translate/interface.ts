import { RawMessage } from "@minecraft/server";

export type languages =
    | "en_US"
    | "en_GB"
    | "de_DE"
    | "es_ES"
    | "es_MX"
    | "fr_FR"
    | "fr_CA"
    | "it_IT"
    | "ja_JP"
    | "ko_KR"
    | "pt_BR"
    | "pt_PT"
    | "ru_RU"
    | "zh_CN"
    | "zh_TW"
    | "nl_NL"
    | "bg_BG"
    | "cs_CZ"
    | "da_DK"
    | "el_GR"
    | "fi_FI"
    | "hu_HU"
    | "id_ID"
    | "nb_NO"
    | "pl_PL"
    | "sk_SK"
    | "sv_SE"
    | "tr_TR"
    | "uk_UA";

export type LangText = {
    [K in languages]?: string;
};

export interface LangTree {
    [key: string]: LangText | LangTree;
}

export type Translator = (
    text: string,
    translation?: LangText,
    params?: Record<string, string | number>
) => string;

export type PureTranslator = (
    translation?: LangText,
    params?: Record<string, string | number>
) => string;

export type UniversalTranslator = <T extends RawMessage | string | LangText | undefined>(
    input: T,
    params?: Record<string, string | number>
) => T extends undefined ? undefined : string | RawMessage;
