import { RawMessage } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { LangText, UniversalTranslator } from "../../Translate";
import { FormText } from "../lang";

type TextType = RawMessage | string | LangText;
type ValueType = boolean | number | string | undefined;

export class FieldParseError extends Error {
    translation: LangText;
    constructor(message: string, translation: LangText, options?: ErrorOptions) {
        super(message, options);
        this.translation = translation;
    }
}

export abstract class BaseField {
    readonly isValueField: boolean = false;
    abstract build(form: ModalFormData, t: UniversalTranslator): void;
}

type OptionalField<F extends ValueField<any>> = F & { __optional: true };
export type FieldValidator<T> = (value: T) => LangText | string | undefined;

export abstract class ValueField<T extends ValueType> extends BaseField {
    readonly isValueField = true;
    protected _key?: string;
    protected __optional: boolean = false;
    protected validators: FieldValidator<T>[] = [];

    getKey(): string | undefined {
        return this._key;
    }
    get isOptional(): boolean {
        return this.__optional;
    }

    /**
     * 将 UI 原始值解析为目标类型。
     * - 如果是基础类型错误（如期待数字却得到布尔），抛出对应类型的 ParseError。
     * - 如果是数值格式错误（如 TextField 输入了非数字），抛出格式 ParseError。
     */
    abstract parse(raw: ValueType): T | undefined;

    /**
     * 执行校验链。
     * - isEmpty 判定：undefined 或空字符串。
     * - 如果必填且为空，返回 Field_Empty 错误。
     */
    validate(value: T | undefined): LangText | string | undefined {
        const isEmpty = value === undefined || (typeof value === "string" && value === "");

        if (isEmpty) {
            return this.isOptional ? undefined : FormText.Field_Empty;
        }

        // 运行自定义验证器 (此时 value 一定是 T 类型)
        for (const v of this.validators) {
            const err = v(value as T);
            if (err) return err;
        }
        return undefined;
    }

    optional() {
        this.__optional = true;
        return this as this & OptionalField<this>;
    }

    key(key: string): this {
        this._key = key;
        return this;
    }

    validator(...v: FieldValidator<T>[]) {
        this.validators.push(...v);
        return this;
    }
}

/** 分割线 */
export class DividerField extends BaseField {
    build(form: ModalFormData) {
        form.divider();
    }
}

/** 文本标签 */
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
            throw new FieldParseError("Expected string", FormText.Error_InvalidString);
        }
        return raw;
    }
}

/** 数字文本输入 */
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

    parse(raw: ValueType): number | undefined {
        if (raw === "" || raw === undefined) return undefined;
        const num = Number(raw);
        if (isNaN(num)) {
            throw new FieldParseError("Input is not a number", FormText.Error_InvalidNumber);
        }
        return num;
    }
}

/** 滑块输入 */
export class SliderField extends ValueField<number> {
    constructor(
        private label: TextType,
        private min: number,
        private max: number,
        private options?: { step?: number; defaultValue?: number; tooltip?: TextType }
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
            throw new FieldParseError(
                "Slider value must be a number",
                FormText.Error_InvalidSlider
            );
        }
        if (raw > this.max || raw < this.min) {
            throw new FieldParseError("Slider value out of range", FormText.Error_InvalidSlider);
        }
        return raw;
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
            throw new FieldParseError("Toggle value must be boolean", FormText.Error_InvalidToggle);
        }
        return raw;
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
        form.dropdown(
            t(this.label),
            this.items.map((i) => t(i)),
            {
                defaultValueIndex: this.defaultValueIndex,
                tooltip: t(this.tooltip),
            }
        );
    }

    parse(raw: ValueType): number | undefined {
        if (raw === undefined) return undefined;
        if (typeof raw !== "number") {
            throw new FieldParseError(
                "Dropdown value must be number index",
                FormText.Error_InvalidDropdown
            );
        }
        return raw;
    }
}
