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
