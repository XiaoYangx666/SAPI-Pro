import { defineLangTree } from "../Translate";

export const FormText = defineLangTree({
    // 基础校验
    Field_Empty: {
        zh_CN: "该项为必填项，不能为空",
        zh_TW: "該項為必填項，不能為空",
        en_US: "This field is required and cannot be empty",
        ja_JP: "この項目は必須であり、空白にすることはできません",
        fr_FR: "Ce champ est obligatoire et ne peut pas être vide",
        ko_KR: "이 필드는 필수이며 비워 둘 수 없습니다",
        es_ES: "Este campo es obligatorio y no puede estar vacío",
        pt_BR: "Este campo é obrigatório e não pode ficar vazio",
    },

    // 数据解析错误
    Error_InvalidString: {
        zh_CN: "数据格式异常：期待文本输入",
        zh_TW: "數據格式異常：期待文本輸入",
        en_US: "Data format error: Expected text input",
        ja_JP: "データ形式エラー：テキスト入力が必要です",
        fr_FR: "Erreur de format : texte attendu",
        ko_KR: "데이터 형식 오류: 텍스트 입력이 필요합니다",
        es_ES: "Error de formato: se esperaba texto",
        pt_BR: "Erro de formato: esperado texto",
    },

    Error_InvalidNumber: {
        zh_CN: "请输入一个有效的数字",
        zh_TW: "請輸入一個有效的數字",
        en_US: "Please enter a valid number",
        ja_JP: "有効な数字を入力してください",
        fr_FR: "Veuillez entrer un nombre valide",
        ko_KR: "유효한 숫자를 입력하십시오",
        es_ES: "Por favor, ingrese un número válido",
        pt_BR: "Por favor, insira um número válido",
    },

    Error_InvalidToggle: {
        zh_CN: "开关状态异常",
        zh_TW: "開關狀態異常",
        en_US: "Invalid toggle state",
        ja_JP: "トグルの状態が無効です",
        fr_FR: "État du bouton non valide",
        ko_KR: "토글 상태가 유효하지 않습니다",
        es_ES: "Estado de interruptor no válido",
        pt_BR: "Estado do interruptor inválido",
    },

    Error_InvalidSlider: {
        zh_CN: "滑块数值异常",
        zh_TW: "滑塊數值異常",
        en_US: "Invalid slider value",
        ja_JP: "スライダーの値が無効です",
        fr_FR: "Valeur du curseur non valide",
        ko_KR: "슬라이더 값이 유효하지 않습니다",
        es_ES: "Valor de control deslizante no válido",
        pt_BR: "Valor do controle deslizante inválido",
    },

    Error_InvalidDropdown: {
        zh_CN: "下拉框选择无效",
        zh_TW: "下拉框選擇無效",
        en_US: "Invalid selection in dropdown",
        ja_JP: "ドロップダウンの選択が無効です",
        fr_FR: "Sélection non valide dans la liste",
        ko_KR: "드롭다운 선택이 유효하지 않습니다",
        es_ES: "Selección no válida en el menú desplegable",
        pt_BR: "Seleção inválida no menu suspenso",
    },

    // 系统级错误
    Field_valiErr: {
        zh_CN: "第 {index} 个输入项验证失败",
        zh_TW: "第 {index} 個輸入項驗證失敗",
        en_US: "Validation failed for input #{index}",
        ja_JP: "{index} 番目の入力項目の検証に失敗しました",
        fr_FR: "Échec de la validation pour l'entrée n°{index}",
        ko_KR: "{index}번째 입력 항목 유효성 검사 실패",
        es_ES: "Error de validación en la entrada n.º {index}",
        pt_BR: "Falha na validação do campo nº {index}",
    },

    // 长度不匹配
    Filed_Len_MisMatch: {
        zh_CN: "表单处理异常：提交的数据量与预期不符",
        zh_TW: "表單處理異常：提交的數據量與預期不符",
        en_US: "Form Error: Submitted data length mismatch",
        ja_JP: "フォームエラー：送信されたデータの長さが一致しません",
        fr_FR: "Erreur de formulaire : longueur des données incorrecte",
        ko_KR: "폼 오류: 제출된 데이터 길이가 일치하지 않습니다",
        es_ES: "Error de formulario: la longitud de los datos no coincide",
        pt_BR: "Erro de formulário: quantidade de dados inconsistente",
    },

    UnknownError: {
        zh_CN: "发生未知错误",
        zh_TW: "發生未知錯誤",
        en_US: "An unknown error occurred",
        ja_JP: "未知のエラーが発生しました",
        fr_FR: "Une erreur inconnue est survenue",
        ko_KR: "알 수 없는 오류가 발생했습니다",
        es_ES: "Ocurrió un error desconocido",
        pt_BR: "Ocorreu um erro desconhecido",
    },
});
