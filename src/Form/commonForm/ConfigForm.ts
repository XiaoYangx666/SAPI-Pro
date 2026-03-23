import { Player } from "@minecraft/server";
import { ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { SAPIProForm, SAPIProFormContext } from "../form";
import { TextType } from "./commonFormInterface";
import { InputForm, InputFormArgs } from "./InputForm";
import {
    DropDownField,
    FieldValidator,
    NumberField,
    SliderField,
    TextField,
    ToggleField,
    ValueField,
} from "./InputFormFields";

/** 类型平展 */
type Simplify<T> = { [K in keyof T]: T[K] } & {};
/** 动态值类型 */
type Dynamic<T, U> = T | ((player: Player, args: U) => T);

export enum FieldType {
    String = "string",
    Number = "number",
    Boolean = "boolean",
    Slider = "slider",
    Dropdown = "dropdown",
}

export type FieldTypeMap = {
    [FieldType.String]: string;
    [FieldType.Number]: number;
    [FieldType.Boolean]: boolean;
    [FieldType.Slider]: number;
    [FieldType.Dropdown]: number;
};

/**
 * 精准结果推导：
 * - String 和 Number 支持 optional (undefined)
 * - Boolean, Slider, Dropdown 始终有值，忽略 optional 标记
 */
export type InferResult<T, U> = Simplify<{
    [K in keyof T]: T[K] extends AnyConfig<U>
        ? T[K]["type"] extends FieldType.String | FieldType.Number
            ? T[K] extends { optional: true }
                ? FieldTypeMap[T[K]["type"]] | undefined
                : FieldTypeMap[T[K]["type"]]
            : FieldTypeMap[T[K]["type"]] // 其他类型始终必选
        : never;
}>;

// --- 配置项定义 ---
interface BaseConfig<T extends FieldType, U> {
    type: T;
    label: Dynamic<TextType, U>;
    defaultValue?: Dynamic<FieldTypeMap[T], U>;
    tooltip?: Dynamic<TextType | undefined, U>;
    optional?: boolean;
    validators?: FieldValidator<FieldTypeMap[T]>[];
    setter?: (value: FieldTypeMap[T], player: Player, args: U) => void | Promise<void>;
}

interface StringConfig<U> extends BaseConfig<FieldType.String, U> {
    placeholder?: Dynamic<TextType, U>;
}
interface NumberConfig<U> extends BaseConfig<FieldType.Number, U> {
    placeholder?: Dynamic<TextType, U>;
}
interface SliderConfig<U> extends BaseConfig<FieldType.Slider, U> {
    min: Dynamic<number, U>;
    max: Dynamic<number, U>;
    step?: Dynamic<number, U>;
}
interface ToggleConfig<U> extends BaseConfig<FieldType.Boolean, U> {}
interface DropdownConfig<U> extends BaseConfig<FieldType.Dropdown, U> {
    items: Dynamic<TextType[], U>;
}

export type AnyConfig<U> =
    | StringConfig<U>
    | NumberConfig<U>
    | SliderConfig<U>
    | ToggleConfig<U>
    | DropdownConfig<U>;

export interface ConfigFormOptions<
    T extends Record<string, AnyConfig<U>>,
    U extends InputFormArgs,
> {
    title: Dynamic<TextType, U>;
    submitButton?: Dynamic<TextType | undefined, U>;
    initialValues?: Dynamic<Partial<InferResult<T, U>>, U>;
    onSubmit?: (result: InferResult<T, U>, player: Player, args: U) => void | Promise<void>;
    onCancel?: (player: Player, args: U) => void | Promise<void>;
}

function resolve<T, U>(val: Dynamic<T, U>, player: Player, args: U): T {
    return typeof val === "function" ? (val as Function)(player, args) : val;
}

/** ConfigForm 实现 */
export class ConfigForm<
    T extends Record<string, AnyConfig<U>>,
    U extends InputFormArgs,
> implements SAPIProForm<ModalFormData, U> {
    private readonly inputForm: InputForm<U, InferResult<T, U>>;

    constructor(
        private readonly schema: T,
        private readonly options: ConfigFormOptions<T, U>
    ) {
        this.inputForm = new InputForm<U, InferResult<T, U>>({
            generator: (form, p, a, t) => {
                form.title(t(resolve(this.options.title, p, a)));
                const btn = resolve(this.options.submitButton, p, a);
                if (btn) form.submitButton(t(btn));
            },
            fieldsGenerator: (p, a) => this.generateFields(p, a),
            onSubmit: async (result, ctx) => {
                await this.runSetters(result, ctx.player, ctx.args);
                await this.options.onSubmit?.(result, ctx.player, ctx.args);
            },
            // 如果 options 没有 onCancel，直传 undefined
            onCancel: this.options.onCancel
                ? (_, ctx) => this.options.onCancel!(ctx.player, ctx.args)
                : undefined,
        });
    }

    builder(player: Player, args: U) {
        return this.inputForm.builder(player, args);
    }
    handler(res: ModalFormResponse, ctx: SAPIProFormContext<ModalFormData, U>) {
        return this.inputForm.handler(res, ctx);
    }

    private generateFields(player: Player, args: U): ValueField<any>[] {
        const initialValues = resolve(this.options.initialValues ?? {}, player, args);
        return Object.entries(this.schema).map(([key, config]) => {
            let field: ValueField<any>;
            const label = resolve(config.label, player, args);
            const tooltip = resolve(config.tooltip, player, args);
            const getDefVal = <FT extends FieldType>(
                c: BaseConfig<FT, U>
            ): FieldTypeMap[FT] | undefined => {
                const gVal = (initialValues as any)[key];
                return gVal !== undefined ? gVal : resolve(c.defaultValue, player, args);
            };

            switch (config.type) {
                case FieldType.String: {
                    const c = config as StringConfig<U>;
                    field = new TextField(
                        label,
                        resolve(c.placeholder ?? "", player, args),
                        getDefVal(c),
                        tooltip
                    );
                    break;
                }
                case FieldType.Number: {
                    const c = config as NumberConfig<U>;
                    field = new NumberField(
                        label,
                        resolve(c.placeholder ?? "", player, args),
                        getDefVal(c),
                        tooltip
                    );
                    break;
                }
                case FieldType.Boolean: {
                    const c = config as ToggleConfig<U>;
                    field = new ToggleField(label, getDefVal(c) ?? false, tooltip);
                    break;
                }
                case FieldType.Slider: {
                    const c = config as SliderConfig<U>;
                    field = new SliderField(
                        label,
                        resolve(c.min, player, args),
                        resolve(c.max, player, args),
                        {
                            defaultValue: getDefVal(c),
                            step: resolve(c.step ?? 1, player, args),
                            tooltip: tooltip,
                        }
                    );
                    break;
                }
                case FieldType.Dropdown: {
                    const c = config as DropdownConfig<U>;
                    field = new DropDownField(
                        label,
                        resolve(c.items, player, args),
                        getDefVal(c) ?? 0,
                        tooltip
                    );
                    break;
                }
                default:
                    throw new Error("Unsupported type");
            }
            field.key(key);
            if (config.optional) field.optional();
            if (config.validators) field.validator(...(config.validators as any[]));
            return field;
        });
    }

    private async runSetters(result: InferResult<T, U>, player: Player, args: U) {
        for (const [key, config] of Object.entries(this.schema)) {
            const val = (result as any)[key];
            if (config.setter && val !== undefined) {
                (config.setter as Function)(val, player, args);
            }
        }
    }
}
