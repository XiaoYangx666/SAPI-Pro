import { LangText } from "../../Translate";
import { FieldValidator } from "./inputFormFields";

/** 验证是否为整数 */
export function isInt(errorMsg: string | LangText = "请输入有效的整数"): FieldValidator<number> {
    return (value: number) => {
        if (!Number.isInteger(value)) return errorMsg;
        return undefined;
    };
}

/** 验证数字范围 */
export function numberRange(
    min?: number,
    max?: number,
    errorMsg?: string | LangText
): FieldValidator<number> {
    return (value: number) => {
        if (min !== undefined && value < min) {
            return errorMsg ?? `数值必须大于等于 ${min}`;
        }

        if (max !== undefined && value > max) {
            return errorMsg ?? `数值必须小于等于 ${max}`;
        }

        return undefined;
    };
}

/** 验证字符串长度范围 */
export function stringLength(
    min: number,
    max: number,
    errorMsg?: string | LangText
): FieldValidator<string> {
    return (value: string) => {
        const len = value.trim().length;
        if (len < min || len > max) {
            return errorMsg ?? `文本长度必须在 ${min} 到 ${max} 个字符之间`;
        }
        return undefined;
    };
}

/** 验证字符串不能为空（不仅仅是空格） */
export function notEmpty(errorMsg: string | LangText = "该字段不能为空"): FieldValidator<string> {
    return (value: string) => {
        if (value.trim().length === 0) return errorMsg;
        return undefined;
    };
}

/** 正则表达式验证 (例如验证邮箱、特定格式的ID等) */
export function pattern(
    reg: RegExp,
    errorMsg: string | LangText = "格式不正确"
): FieldValidator<string> {
    return (value: string) => {
        if (!reg.test(value)) return errorMsg;
        return undefined;
    };
}
