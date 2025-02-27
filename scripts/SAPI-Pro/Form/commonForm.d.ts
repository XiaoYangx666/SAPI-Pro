import { Player } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { context, FormHandler, FormValidator, NavigationCommand } from "./main";
export declare class CommonForm {
    /**常用的按钮表单 */
    static ButtonForm(id: string, data: ButtonFormData): void;
    /** 按钮列表表单*/
    static ButtonListForm(id: string, data: ButtonListFormData): void;
    /**
     * 一个简单的提示窗口，仅含有两个按钮，
     */
    static SimpleMessageForm(id: string, data: SimpleMessageFormData): void;
    /**
     * 注册一个简单的信息窗口
     * @param title 标题
     * @param body 内容，可以是生成器
     */
    static BodyInfoForm(id: string, title: string, body: formGenerator<ActionFormData> | string): void;
}
export interface FuncButton {
    /**图标路径，从textures/后面开始输 */
    icon?: string;
    /**按钮点击事件 */
    func: (player: Player, context: context) => Promise<NavigationCommand | undefined> | NavigationCommand | undefined;
}
export interface formGenerator<T> {
    /**自定义表单生成器，不要和原本的冲突了 */
    (form: T, player: Player, context: context): void;
}
export interface buttonGenerator {
    /**按钮生成器，用于自定义按钮 */
    (player: Player, context: context): Record<string, FuncButton> | undefined;
}
export interface ButtonFormData {
    title?: string;
    body?: string;
    /**按钮对象 */
    buttons?: Record<string, FuncButton>;
    /**按钮生成器 */
    buttonGenerator?: buttonGenerator;
    /**取消事件 */
    oncancel?: FormHandler;
    /**自定义生成器，如果只需要按钮可以用按钮生成器 */
    generator?: formGenerator<ActionFormData>;
    /**表单验证器，验证失败则不打开表单 */
    validator?: FormValidator;
}
export interface ListFormHandler {
    (player: Player, selection: number, context: context): Promise<NavigationCommand | undefined> | NavigationCommand | undefined;
}
export interface ButtonListFormData {
    title?: string;
    body?: string;
    generator?: formGenerator<ActionFormData>;
    handler: ListFormHandler;
    oncancel?: FormHandler;
    validator?: FormValidator;
}
export interface SimpleMessageFormData {
    title?: string;
    body?: string;
    generator?: (form: MessageFormData, player: Player, context: context) => void;
    button1?: string;
    button2?: string;
    handler: FormHandler;
}
