import { Player } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { SAPIProFormContext } from "./form";
import { formDataType, contextArgs, formHandler, formBeforeBuild } from "./interface";
import { LangText } from "../Translate";

export interface FuncButton<U extends contextArgs> {
    /**图标路径，从textures/后面开始输 */
    icon?: string;
    translation?: LangText;
    /**按钮点击事件 */
    func: (context: SAPIProFormContext<ActionFormData, U>) => void | Promise<void>;
}
export interface formGenerator<T extends formDataType, U extends contextArgs> {
    /**自定义表单生成器，不要和原本的冲突了 */
    (form: T, player: Player, args: U): void | Promise<void>;
}
export interface buttonGenerator<U extends contextArgs> {
    /**按钮生成器，用于自定义按钮 */
    (player: Player, args: U): Record<string, FuncButton<U>> | undefined;
}
export interface ButtonFormArgs extends contextArgs {
    buttons?: Record<string, FuncButton<this>>;
}
export interface ButtonFormData<U extends contextArgs = contextArgs> {
    title?: string | LangText;
    body?: string | LangText;
    /**按钮对象 */
    buttons?: Record<string, FuncButton<U>>;
    /**按钮生成器 */
    buttonGenerator?: buttonGenerator<U>;
    /**取消事件 */
    oncancel?: formHandler<ActionFormData, U>;
    /**自定义生成器，如果只需要按钮可以用按钮生成器 */
    generator?: formGenerator<ActionFormData, U>;
    /**表单验证器，验证失败则不打开表单 */
    validator?: formBeforeBuild<ActionFormData, U>;
}

export interface ListFormHandler<U extends contextArgs> {
    (selection: number, context: SAPIProFormContext<ActionFormData, U>): void | Promise<void>;
}

export interface ButtonListFormData<U extends contextArgs = contextArgs> {
    title?: string | LangText;
    body?: string | LangText;
    generator?: formGenerator<ActionFormData, U>;
    handler: ListFormHandler<U>;
    oncancel?: formHandler<ActionFormData, U>;
    validator?: formBeforeBuild<ActionFormData, U>;
}

export interface SimpleMessageFormData<U extends contextArgs = contextArgs> {
    title?: string | LangText;
    body?: string | LangText;
    generator?: (form: MessageFormData, player: Player, args: contextArgs) => void | Promise<void>;
    button1?: string;
    button2?: string;
    handler: formHandler<MessageFormData, U>;
}
