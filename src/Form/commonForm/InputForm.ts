import { Player, RawMessage } from "@minecraft/server";
import { ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { LangText, translator } from "../../Translate";
import { SAPIProForm, SAPIProFormContext } from "../form";
import { contextArgs, formHandler } from "../interface";
import { FormText } from "../lang";
import { CommonFormData } from "./commonFormInterface";
import { BaseField, ValueField } from "./inputFormFields";

export interface InputFormArgs extends contextArgs {
    fields?: ValueField<any>[];
}

/**
 * 输入表单配置
 * @template U 传递给表单的参数类型
 * @template TResult 表单解析后的数据类型
 */
export interface InputFormData<U extends InputFormArgs, TResult = any> extends CommonFormData<
    ModalFormData,
    U
> {
    /** 提交按钮文本 */
    submitButton?: RawMessage | string;

    /** 表单字段列表（输入框、开关、下拉、UI组件等） */
    fields: BaseField[];

    /** 动态生成字段（构建表单时追加到 fields 后） */
    fieldsGenerator?: (player: Player, args: U) => BaseField[];

    /** 是否显示默认验证失败提示（默认 true） */
    validationMessage?: boolean;

    /** 玩家取消表单时回调 */
    onCancel?: formHandler<ModalFormData, U>;

    /**
     * 字段验证失败回调。
     * 若提供此函数，框架不会自动提示或重新打开表单。
     */
    onValidateFailed?: (
        ctx: SAPIProFormContext<ModalFormData, U>,
        field: ValueField<any>,
        validationMes: string | LangText
    ) => void | Promise<void>;

    /**
     * 表单整体校验（用于跨字段验证）。
     * 返回错误信息表示失败，undefined 表示通过。
     */
    validateForm?: (data: TResult) => string | LangText | undefined;

    /**
     * 表单整体校验失败回调。
     * 若提供此函数，框架不会自动提示或重新打开表单。
     */
    onFormValidateFailed?: (
        ctx: SAPIProFormContext<ModalFormData, U>,
        validationMes: string | LangText,
        data: TResult
    ) => void | Promise<void>;

    /** 所有验证通过后的提交回调 */
    onSubmit: (data: TResult, ctx: SAPIProFormContext<ModalFormData, U>) => void | Promise<void>;
}

export class InputForm<U extends InputFormArgs, TResult = any> implements SAPIProForm<
    ModalFormData,
    U
> {
    constructor(private readonly data: InputFormData<U, TResult>) {}

    builder(p: Player, args: U) {
        const form = new ModalFormData();
        const t = translator.createUniversal(p);
        const data = this.data;

        if (data.title) form.title(t(data.title));
        if (data.generator) data.generator(form, p, args, t);
        if (data.submitButton) form.submitButton(t(data.submitButton));

        const fields = [...data.fields, ...(data.fieldsGenerator?.(p, args) ?? [])];

        for (let field of fields) {
            field.build(form, t);
        }

        // 将值字段筛选出来存入 args，以便 handler 处理时能一一对应
        args.fields = fields.filter((f) => f.isValueField) as ValueField<any>[];

        return form;
    }

    async handler(res: ModalFormResponse, ctx: SAPIProFormContext<ModalFormData, U>) {
        if (res.canceled || !res.formValues) {
            await this.data.onCancel?.(res, ctx);
            return;
        }

        const fields = ctx.args.fields as ValueField<any>[];
        const values = res.formValues;
        const t = translator.createPureFor(ctx.player);

        if (values.length != fields.length) {
            ctx.player.sendMessage("§c" + t(FormText.Filed_Len_MisMatch));
            return ctx.reopen();
        }

        let ans: string | LangText | undefined;
        let field: ValueField<any> | undefined;

        const result: Record<string, any> = {};

        // 1. 字段级解析与基础验证
        for (let i = 0; i < fields.length; i++) {
            field = fields[i];

            try {
                const parsed = field.parse(values[i]);

                ans = field.validate(parsed);
                if (ans !== undefined) break;

                // 写入 result
                if (field.key !== undefined) {
                    result[field.key] = parsed;
                }
            } catch (err) {
                ans = err instanceof Error ? err.message : FormText.UnknownError;
                break;
            }
        }

        // 字段级错误
        if (ans !== undefined) {
            if (this.data.onValidateFailed) {
                await this.data.onValidateFailed(ctx, field!, ans);
            } else {
                if (this.data.validationMessage ?? true) {
                    const mes = typeof ans == "string" ? ans : t(ans);
                    ctx.player.sendMessage("§c" + mes);
                }
                return ctx.reopen();
            }
            return;
        }

        const typedResult = result as TResult;

        // 2. 表单级验证
        if (this.data.validateForm) {
            const formErr = this.data.validateForm(typedResult);

            if (formErr !== undefined) {
                if (this.data.onFormValidateFailed) {
                    await this.data.onFormValidateFailed(ctx, formErr, typedResult);
                } else {
                    if (this.data.validationMessage ?? true) {
                        const mes = typeof formErr === "string" ? formErr : t(formErr);
                        ctx.player.sendMessage("§c" + mes);
                    }
                    return ctx.reopen();
                }
                return;
            }
        }

        // 3. 提交
        await this.data.onSubmit(typedResult, ctx);
    }
}
