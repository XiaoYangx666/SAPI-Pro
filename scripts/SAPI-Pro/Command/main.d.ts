import { ChatSendBeforeEvent, Player, Vector3 } from "@minecraft/server";
import { chatOpe } from "SAPI-Pro/Event";
import { paramTypes } from "./ParamTypes";
export interface ParsedParam {
    [key: string]: any;
}
export type commandHandler<T = ParsedParam> = (player: Player, params: T) => void;
export type parsedTypes = number | boolean | string | Player | Vector3;
type paramBranches = ParamObject[] | ParamObject;
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
export declare class Command {
    name: string;
    explain: string;
    isAdmin: boolean;
    isHidden: boolean;
    handler?: commandHandler;
    validator?: CommandValidator;
    isClientCommand?: boolean;
    paramBranches: ParamDefinition[];
    subCommands: Command[];
    /**
     * 构造新命令(复杂的推荐用Command.fromObject)
     * @param name 命令名
     * @param explain 命令解释
     * @param isAdmin 是否管理员命令，默认否
     * @param handler 命令处理器
     * @param validator 命令验证器
     * @param isHidden 是否隐藏命令
     * @param isClient 是否客户端命令(客户端行为包)
     */
    constructor(name: string, explain: string, isAdmin: boolean, handler?: commandHandler, validator?: CommandValidator, isHidden?: boolean, isClient?: boolean);
    /**添加子命令 */
    addSubCommand(subCommand: Command): this;
    /**添加一堆子命令 */
    addSubCommands(subCommands: Command[]): this;
    /**添加一条分支并在其中添加一条参数 */
    addParam(param: ParamDefinition): this;
    /**添加一条参数分支的多个参数 */
    addParams(params: ParamDefinition[]): this;
    /**添加多个命令参数分支 */
    addParamBranches(param: paramBranches[]): this;
    /** 从Object创建命令 */
    static fromObject(obj: CommandObject): Command;
    private static fromParamBranches;
    private static toTreeParam;
}
export declare class ParseInfo {
    value: parsedTypes;
    cnt: number;
    constructor(value: parsedTypes, cnt?: number);
}
export declare class ParseError {
    msg?: string;
    onlymsg?: boolean;
    index: number;
    /**深度相同时是否允许被替换 */
    canReplace: boolean;
    constructor(msg?: string, onlymsg?: boolean, index?: number, canReplace?: boolean);
}
export declare class commandParser {
    commands: Map<string, Command>;
    constructor();
    /** 注册命令 */
    registerCommand(command: Command): void;
    /**客户端注册指令 */
    regToHost(): void;
    /**注册客户端命令(系统调用，不用管) */
    regClientCommand(): void;
    /** 运行命令注册回调*/
    runCommand(t: ChatSendBeforeEvent): chatOpe | undefined;
    /**直接解析一条命令 */
    parseCommand(input: string, player: Player): chatOpe;
    /**寻找最深的命令 */
    private findCommand;
    private parseSubCommand;
    private parseParams;
    static ErrorMessage(player: Player, command: Command, value: string, params: string[], current: number, tip?: string | undefined): void;
    private static BuildErrorMessage;
    private ErrorMes;
    getCommandInfo(command: string): Command | undefined;
    getCommandsList(admin: boolean): string[];
}
export declare const pcommand: commandParser;
export {};
