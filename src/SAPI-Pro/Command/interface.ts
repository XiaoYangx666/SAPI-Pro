import { Player, Vector3 } from "@minecraft/server";
import { paramTypes } from "./parser/ParamTypes";

export interface ParsedParam {
    [key: string]: any;
}
export type commandHandler<T = ParsedParam> = (player: Player, params: T) => void;
export type parsedTypes = number | boolean | string | Player | Vector3;

export type paramBranches = ParamObject[] | ParamObject;
export interface CommandObject {
    /**命令名 */
    name: string;
    /**命令解释 */
    explain: string;
    /**是否管理员命令,默认不是*/
    isAdmin?: boolean;
    /**是否隐藏命令(不会显示在help中) */
    isHiden?: boolean;
    /**命令处理器 */
    handler?: commandHandler;
    /**命令验证器 */
    validator?: CommandValidator;
    /**命令参数分支*/
    paramBranches?: paramBranches[];
    /**子命令列表 */
    subCommands?: CommandObject[];
    isClientCommand?: boolean;
}

export interface CommandValidator {
    /**命令验证器，返回true或失败提示 */
    (player: Player): true | string;
}

export interface ParamValidator {
    /**参数验证器，返回true或失败提示 */
    (value: any, player: Player): true | ParseError | string;
}
export interface ParamObject {
    /**参数名 */
    name: string;
    /**参数类型 */
    type: keyof typeof paramTypes;
    /**枚举值 */
    enums?: string[];
    /**是否可选，默认否 */
    optional?: boolean;
    /**默认值 */
    default?: parsedTypes;
    /**参数解释 */
    explain?: string;
    /**参数验证器 */
    validator?: ParamValidator;
    /** 参数分支*/
    branches?: paramBranches[];
}
export interface ParamDefinition extends ParamObject {
    subParams?: ParamDefinition[];
}

export class ParseInfo {
    value: parsedTypes;
    cnt: number;
    constructor(value: parsedTypes, cnt = 1) {
        this.value = value;
        this.cnt = cnt;
    }
}

export class ParseError {
    msg?: string;
    onlymsg?: boolean;
    index: number;
    /**深度相同时是否允许被替换 */
    canReplace: boolean;
    constructor(msg?: string, onlymsg?: boolean, index: number = 0, canReplace: boolean = true) {
        this.msg = msg;
        this.onlymsg = onlymsg;
        this.index = index;
        this.canReplace = canReplace;
    }
}
