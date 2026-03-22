import { RawMessage } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { LangText, UniversalTranslator } from "../../Translate";
import { FormText } from "../lang";

type TextType = RawMessage | string | LangText;
type ValueType = boolean | number | string | undefined;

export abstract class BaseField {
    /** 是否是值字段 */
    readonly isValueField: boolean = false;

    /** UI 构建 */
    abstract build(form: ModalFormData, t: UniversalTranslator): void;
}

type OptionalField<F extends ValueField<any>> = F & { __optional: true };

export type FieldValidator<T> = (value: T) => LangText | string | undefined;

export abstract class ValueField<T extends ValueType> extends BaseField {
    readonly isValueField = true;

    protected _key?: string;
    getKey(): string | undefined {
        return this._key;
    }

    protected __optional: boolean = false;
    get isOptional(): boolean {
        return this.__optional;
    }

    protected validators: FieldValidator<T>[] = [];

    /** 类型判断与转换，若类型不正确则抛出错误 */
    abstract parse(raw: ValueType): T;

    /** 基础类型校验（类型层面） */
    protected abstract baseValidate(value: T): LangText | string | undefined;

    /** 执行完整校验链 */
    validate(value: T): LangText | string | undefined {
        // 如果是可选字段，且未输入任何实质内容，则跳过后续验证
        if (this.isOptional && (value === undefined || value === "")) {
            return undefined;
        }

        const baseErr = this.baseValidate(value);
        if (baseErr) return baseErr;

        for (const v of this.validators) {
            const err = v(value);
            if (err) return err;
        }
        return undefined;
    }

    /** 标记为可选字段 */
    optional() {
        this.__optional = true;
        return this as this & OptionalField<this>;
    }

    /** 设置字段键名，用于最终推导为对象属性 */
    key(key: string): this {
        this._key = key;
        return this;
    }

    /** 添加自定义验证器 */
    validator(...v: FieldValidator<T>[]) {
        this.validators.push(...v);
        return this;
    }
}

/** 分割线（非值字段） */
export class DividerField extends BaseField {
    build(form: ModalFormData) {
        form.divider();
    }
}

/** 文本标签（非值字段） */
export class LabelField extends BaseField {
    constructor(private text: TextType) {
        super();
    }

    build(form: ModalFormData, t: UniversalTranslator) {
        form.label(t(this.text));
    }
}

/** 文本输入 */
export class TextField extends ValueField<string> {
    constructor(
        private label: TextType,
        private placeholder: TextType,
        private defaultValue?: string | LangText,
        private tooltip?: TextType
    ) {
        super();
    }

    build(form: ModalFormData, t: UniversalTranslator) {
        form.textField(t(this.label), t(this.placeholder), {
            defaultValue: t(this.defaultValue) as string,
            tooltip: t(this.tooltip),
        });
    }

    parse(raw: ValueType): string {
        if (typeof raw !== "string") {
            throw new Error("TextField: expected string, got " + typeof raw);
        }
        return raw;
    }

    protected baseValidate(value: string) {
        if (typeof value !== "string") {
            return FormText.TextFiled_NotString;
        }
        return undefined;
    }
}

/** 数字文本输入（通过文本框输入数字） */
export class NumberField extends ValueField<number> {
    constructor(
        private label: TextType,
        private placeholder: TextType,
        private defaultValue?: number,
        private tooltip?: TextType
    ) {
        super();
    }

    build(form: ModalFormData, t: UniversalTranslator) {
        form.textField(t(this.label), t(this.placeholder), {
            defaultValue: this.defaultValue?.toString(),
            tooltip: t(this.tooltip),
        });
    }

    parse(raw: ValueType): number {
        if (this.isOptional && raw === "") {
            return undefined as any; // 配合可选逻辑放行
        }

        if (typeof raw === "string") {
            const num = Number(raw);
            if (raw.trim() === "" || isNaN(num)) {
                throw new Error("请输入有效的数字格式"); // 友好的报错提示
            }
            return num;
        }
        throw new Error("NumberField: expected string, got " + typeof raw);
    }

    protected baseValidate(value: number) {
        if (typeof value !== "number" || isNaN(value)) {
            return FormText.TextFiled_NotNumber;
        }
        return undefined;
    }
}

/** 滑块输入 */
export class SliderField extends ValueField<number> {
    constructor(
        private label: TextType,
        private min: number,
        private max: number,
        private options?: {
            step?: number;
            defaultValue?: number;
            tooltip?: TextType;
        }
    ) {
        super();
    }

    build(form: ModalFormData, t: UniversalTranslator) {
        form.slider(
            t(this.label),
            this.min,
            this.max,
            this.options
                ? {
                      defaultValue: this.options.defaultValue,
                      tooltip: t(this.options.tooltip),
                      valueStep: this.options.step,
                  }
                : undefined
        );
    }

    parse(raw: ValueType): number {
        if (typeof raw !== "number") {
            throw new Error("SliderField: expected number, got " + typeof raw);
        }
        return raw;
    }

    protected baseValidate(value: number) {
        if (typeof value !== "number" || isNaN(value)) {
            return FormText.TextFiled_NotNumber;
        }
        return undefined;
    }
}

/** 开关 */
export class ToggleField extends ValueField<boolean> {
    constructor(
        private label: TextType,
        private defaultValue = false,
        private tooltip?: TextType
    ) {
        super();
    }

    build(form: ModalFormData, t: UniversalTranslator) {
        form.toggle(t(this.label), { defaultValue: this.defaultValue, tooltip: t(this.tooltip) });
    }

    parse(raw: ValueType): boolean {
        if (typeof raw !== "boolean") {
            throw new Error("ToggleField: expected boolean, got " + typeof raw);
        }
        return raw;
    }

    protected baseValidate(value: boolean) {
        if (typeof value !== "boolean") {
            return FormText.ToggleFiled_NotBoolean;
        }
        return undefined;
    }
}

/** 下拉菜单 */
export class DropDownField extends ValueField<number> {
    constructor(
        private label: TextType,
        private items: TextType[],
        private defaultValueIndex: number = 0,
        private tooltip?: TextType
    ) {
        super();
    }

    build(form: ModalFormData, t: UniversalTranslator) {
        const parsedItems = this.items.map((item) => t(item));
        form.dropdown(t(this.label), parsedItems, {
            defaultValueIndex: this.defaultValueIndex,
            tooltip: t(this.tooltip),
        });
    }

    parse(raw: ValueType): number {
        if (typeof raw !== "number") {
            throw new Error("DropDownField: expected number, got " + typeof raw);
        }
        return raw;
    }

    protected baseValidate(value: number) {
        if (typeof value !== "number" || isNaN(value)) {
            return FormText.TextFiled_NotNumber;
        }
        return undefined;
    }
}
