import { Player } from "@minecraft/server";
import { ActionFormData, ActionFormResponse, MessageFormData, MessageFormResponse, ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
export interface context {
    [key: string]: any;
}
export interface FormContext {
    name: string;
    data: context;
}
export interface FormBuiler {
    (player: Player, context: context): Promise<ActionFormData | ModalFormData | MessageFormData> | ActionFormData | ModalFormData | MessageFormData;
}
export interface FormHandler {
    /**
     * 表单处理函数
     * @param response 表单返回
     * @param context 表单上下文，可用于获取传值
     */
    (player: Player, response: ActionFormResponse | ModalFormResponse | MessageFormResponse, context: context): Promise<NavigationCommand | undefined> | NavigationCommand | undefined | void;
}
export interface FormValidator {
    /**
     * 表单验证器，返回是否打开表单或自定义表单操作
     */
    (player: Player, context: context): boolean | NavigationCommand;
}
export interface FormData {
    /**表单的唯一ID */
    id: string;
    /**构建器 */
    builder: FormBuiler;
    /**表单处理器 */
    handler: FormHandler;
    /**表单验证器 */
    validator?: FormValidator;
}
export declare enum NavType {
    /** 打开新页面*/
    OPEN_NEW = 0,
    /**返回上一页 */
    BACK = 1,
    /**刷新当前页面 */
    REOPEN = 2,
    /** 关闭所有*/
    CLOSE = 3,
    /**重置并打开新页面 */
    RESET_OPEN = 4,
    /**替换当前页面 */
    REPLACE = 5
}
export interface NavigationCommand {
    /** 导航操作类型*/
    type: NavType;
    /**表单id */
    formId?: string;
    /**上下文 */
    contextData?: any;
}
export declare class FormManager {
    private static forms;
    /**注册一个表单 */
    static register(formData: FormData): void;
    /**注册一堆表单 */
    static registerAll(formDatas: FormData[]): void;
    private static getForm;
    private static showForm;
    private static handleNavigation;
    /**
     * 为玩家打开指定ID的表单
     * 需要先注册表单
     */
    static open(player: Player, formId: string, initialData?: any, delay?: number, isfirst?: boolean): void;
}
