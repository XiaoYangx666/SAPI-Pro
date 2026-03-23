import { ActionFormData } from "@minecraft/server-ui";
import { SAPIProFormContext } from "../form";
import { BodyInfoForm } from "./BodyInfoForm";
import { ButtonForm } from "./ButtonForm";
import {
    ButtonFormArgs,
    ButtonFormData,
    SimpleMessageFormData,
    TextType,
    formGenerator,
} from "./commonFormInterface";
import { AnyConfig, ConfigForm, ConfigFormOptions } from "./ConfigForm";
import { InputForm, InputFormArgs, InputFormData } from "./InputForm";
import { SimpleMessageForm } from "./MessageForm";

export * from "./BodyInfoForm";
export * from "./ButtonForm";
export * from "./commonFormInterface";
export * from "./InputForm";
export * from "./InputFormFields";
export * from "./MessageForm";
export * from "./ConfigForm";
export * as Validators from "./validators";

export class CommonForm {
    private constructor() {}

    /**常用的按钮表单 */
    static ButtonForm<U extends ButtonFormArgs>(data: ButtonFormData<U>) {
        return new ButtonForm<U>(data);
    }
    /**
     * 一个简单的提示窗口，仅含有两个按钮，
     */
    static SimpleMessageForm<U extends ButtonFormArgs>(data: SimpleMessageFormData<U>) {
        return new SimpleMessageForm<U>(data);
    }
    /**
     * 注册一个简单的信息窗口
     * @param title 标题
     * @param body 内容，可以是生成器
     * @param onSubmit 提交后执行
     */
    static BodyInfoForm<U extends ButtonFormArgs>(
        title: TextType,
        body: formGenerator<ActionFormData, U> | TextType,
        onSubmit?: (ctx: SAPIProFormContext<ActionFormData, U>) => void
    ) {
        return new BodyInfoForm<U>(title, body, onSubmit);
    }

    /**输入表单 */
    static InputForm<TResult extends any, U extends InputFormArgs = any>(
        data: InputFormData<U, TResult>
    ) {
        return new InputForm<U, TResult>(data);
    }

    /**配置表单 */
    static ConfigForm<U extends InputFormArgs>() {
        return {
            create: <T extends Record<string, AnyConfig<U>>>(
                schema: T,
                options: ConfigFormOptions<T, U>
            ) => new ConfigForm<T, U>(schema, options),
        };
    }
}
