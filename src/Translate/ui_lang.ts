import { defineLangTree } from "./translator";

export const LangUIText = defineLangTree({
    dropdown_label: {
        zh_CN: "选择语言",
        zh_TW: "選擇語言",
        en_US: "Select Language",
        ja_JP: "言語を選択",
        fr_FR: "Choisir la langue",
        es_ES: "Seleccionar idioma",
        ko_KR: "언어 선택",
        pt_BR: "Selecionar idioma",
    },
    setSuccess: {
        zh_CN: "语言设置成功",
        zh_TW: "語言設定成功",
        en_US: "Language setting updated successfully",
        ja_JP: "言語設定が正常に更新されました",
        fr_FR: "La langue a été définie avec succès",
        es_ES: "Idioma configurado correctamente",
        ko_KR: "언어 설정이 완료되었습니다",
        pt_BR: "Idioma definido com sucesso",
    },

    setFailed: {
        zh_CN: "语言设置失败",
        zh_TW: "語言設定失敗",
        en_US: "Failed to update language settings",
        ja_JP: "言語設定の変更に失敗しました",
        fr_FR: "Échec de la modification de la langue",
        es_ES: "Error al configurar el idioma",
        ko_KR: "언어 설정에 실패했습니다",
        pt_BR: "Falha ao definir o idioma",
    },
});

export const langCmdText = defineLangTree({
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
