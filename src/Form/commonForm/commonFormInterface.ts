import { Player, PlayerPermissionLevel, RawMessage } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { LangText, UniversalTranslator } from "../../Translate";
import { SAPIProFormContext } from "../form";
import { contextArgs, formBeforeBuild, formDataType, formHandler } from "../interface";

export type TextType = string | LangText | RawMessage;

//基础部分
/**自定义表单生成器 */
export interface formGenerator<T extends formDataType, U extends contextArgs> {
    (form: T, player: Player, args: U, t: UniversalTranslator): void | Promise<void>;
}

export interface CommonFormData<T extends formDataType, U extends contextArgs = contextArgs> {
    /**标题 */
    title?: TextType;
    /**自定义生成器 */
    generator?: formGenerator<T, U>;
}

//ButtonForm部分
export interface FuncButton<U extends contextArgs, TData = unknown> {
    /**图标路径，从textures/后面开始输 */
    icon?: string;
    /**按钮文本(支持翻译) */
    label: TextType;
    /**玩家权限，具有对应权限才会显示按钮 */
    permission?: PlayerPermissionLevel;
    /**按钮是否应该显示(默认显示) */
    shouldShow?: (player: Player, args: U) => boolean;
    /**按钮点击事件 */
    func?: (context: SAPIProFormContext<ActionFormData, U>) => void | Promise<void>;
    /**附带自定义属性 */
    data?: TData;
}

export interface ButtonFormArgs extends contextArgs {
    buttons?: FuncButton<this>[];
}

export interface ButtonFormData<
    U extends contextArgs = contextArgs,
    TData = unknown,
> extends CommonFormData<ActionFormData, U> {
    /**body */
    body?: TextType;
    /**按钮列表 */
    buttons?: FuncButton<U, TData>[];
    /**按钮生成器 */
    buttonGenerator?: (
        player: Player,
        args: U,
        t: UniversalTranslator
    ) => Iterable<FuncButton<U, TData>>;
    /**列表处理(若点击的按钮已有func，则不会调用此函数处理) */
    handler?: (
        ctx: SAPIProFormContext<ActionFormData, U>,
        /**按下的按钮 data为构造时附带的数据,btnIndex为排除func按钮后的下标 */
        button: { data: TData; btnIndex: number },
        /**表单选择的下标 */
        index: number
    ) => Promise<void> | void;
    /**取消事件 */
    oncancel?: formHandler<ActionFormData, U>;
    /**表单验证器，验证失败则不打开表单 */
    validator?: formBeforeBuild<ActionFormData, U>;
}

//MessageForm部分
export interface MessageFormButton<U extends contextArgs> {
    text: TextType;
    /**按钮点击事件 */
    func: (context: SAPIProFormContext<MessageFormData, U>) => void | Promise<void>;
}

export interface SimpleMessageFormData<U extends contextArgs = contextArgs> extends CommonFormData<
    MessageFormData,
    U
> {
    /**body */
    body?: TextType;
    button1?: MessageFormButton<U>;
    button2?: MessageFormButton<U>;
}
