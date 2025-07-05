import { Player } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { SAPIProFormContext } from "./form";
import { formDataType, contextArgs, formHandler, formBeforeBuild } from "./interface";

export interface FuncButton {
    /**图标路径，从textures/后面开始输 */
    icon?: string;
    /**按钮点击事件 */
    func: (context: SAPIProFormContext<ActionFormData>) => void | Promise<void>;
}
export interface formGenerator<T extends formDataType> {
    /**自定义表单生成器，不要和原本的冲突了 */
    (form: T, player: Player, args: contextArgs): void | Promise<void>;
}
export interface buttonGenerator {
    /**按钮生成器，用于自定义按钮 */
    (player: Player, args: contextArgs): Record<string, FuncButton> | undefined;
}
export interface ButtonFormData {
    title?: string;
    body?: string;
    /**按钮对象 */
    buttons?: Record<string, FuncButton>;
    /**按钮生成器 */
    buttonGenerator?: buttonGenerator;
    /**取消事件 */
    oncancel?: formHandler<ActionFormData>;
    /**自定义生成器，如果只需要按钮可以用按钮生成器 */
    generator?: formGenerator<ActionFormData>;
    /**表单验证器，验证失败则不打开表单 */
    validator?: formBeforeBuild<ActionFormData>;
}

export interface ListFormHandler {
    (selection: number, context: SAPIProFormContext<ActionFormData>): void | Promise<void>;
}

export interface ButtonListFormData<> {
    title?: string;
    body?: string;
    generator?: formGenerator<ActionFormData>;
    handler: ListFormHandler;
    oncancel?: formHandler<ActionFormData>;
    validator?: formBeforeBuild<ActionFormData>;
}

export interface SimpleMessageFormData {
    title?: string;
    body?: string;
    generator?: (form: MessageFormData, player: Player, args: contextArgs) => void | Promise<void>;
    button1?: string;
    button2?: string;
    handler: formHandler<MessageFormData>;
}
