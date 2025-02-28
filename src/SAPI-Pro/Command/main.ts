import { ChatSendBeforeEvent, Player, Vector3 } from "@minecraft/server";
import { LibConfig } from "SAPI-Pro/Config";
import { exchangedb } from "SAPI-Pro/DataBase";
import { chatBus, chatOpe } from "SAPI-Pro/Event";
import { isAdmin } from "SAPI-Pro/func";
import { enterNodeFunc, PreOrdertraverse, traverseAct } from "./func";
import { CommandHelp } from "./help";
import { paramParser, paramTypes } from "./ParamTypes";
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
export class Command {
    name: string;
    explain: string;
    isAdmin: boolean;
    isHidden: boolean;
    handler?: commandHandler;
    validator?: CommandValidator;
    isClientCommand?: boolean;
    paramBranches: ParamDefinition[] = [];
    subCommands: Command[] = [];
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
    constructor(name: string, explain: string, isAdmin: boolean, handler?: commandHandler, validator?: CommandValidator, isHidden = false, isClient = false) {
        this.name = name;
        this.explain = explain;
        this.isAdmin = isAdmin;
        this.handler = handler;
        this.validator = validator;
        this.isHidden = isHidden;
        this.isClientCommand = isClient;
    }

    /**添加子命令 */
    addSubCommand(subCommand: Command) {
        this.subCommands.push(subCommand);
        return this;
    }

    /**添加一堆子命令 */
    addSubCommands(subCommands: Command[]) {
        for (const subCommand of subCommands) {
            this.subCommands.push(subCommand);
        }
        return this;
    }

    /**添加一条分支并在其中添加一条参数 */
    addParam(param: ParamDefinition) {
        this.paramBranches.push(param);
        return this;
    }
    /**添加一条参数分支的多个参数 */
    addParams(params: ParamDefinition[]) {
        const param = Command.toTreeParam(params);
        if (param) this.paramBranches.push(param);
        return this;
    }
    /**添加多个命令参数分支 */
    addParamBranches(param: paramBranches[]) {
        this.paramBranches.push(
            ...param
                .map((param) => {
                    if (Array.isArray(param)) {
                        return Command.toTreeParam(param);
                    } else {
                        return param;
                    }
                })
                .filter((p) => p != undefined)
                .sort((a, b) => {
                    return paramTypes[a.type] - paramTypes[b.type];
                })
        );
        return this;
    }
    /** 从Object创建命令 */
    static fromObject(obj: CommandObject): Command {
        const command = new Command(obj.name, obj.explain, obj.isAdmin ?? false, obj.handler, obj.validator, obj.isHiden, obj.isClientCommand);
        if (obj.paramBranches) {
            command.paramBranches = Command.fromParamBranches(obj.paramBranches);
        }
        if (obj.subCommands) {
            obj.subCommands.forEach((subCommand) => {
                command.subCommands.push(Command.fromObject(subCommand));
            });
        }
        return command;
    }
    private static fromParamBranches(paramBranches: (ParamDefinition | ParamDefinition[])[]) {
        let subParams: ParamDefinition[] = [];
        for (let branch of paramBranches) {
            if (Array.isArray(branch)) {
                if (branch.length != 0) {
                    const param = Command.toTreeParam(branch);
                    if (param) subParams.push(param);
                }
            } else {
                if (branch.branches) {
                    const params = this.fromParamBranches(branch.branches);
                    branch.subParams = [...(branch.subParams ?? []), ...params];
                    delete branch.branches;
                }
                subParams.push(branch);
            }
        }
        return subParams.sort((a, b) => {
            return paramTypes[a.type] - paramTypes[b.type];
        });
    }
    private static toTreeParam(params: ParamDefinition[]): ParamDefinition | undefined {
        for (let i = 0; i < params.length; i++) {
            const param = params[i];
            if (param.branches && param.branches.length != 0) {
                // console.warn(param.name);
                param.subParams = Command.fromParamBranches(param.branches);
                delete param.branches;
            }
            if (i + 1 != params.length) {
                param.subParams = param.subParams ?? [];
                param.subParams?.push(params[i + 1]);
            }
        }
        return params[0];
    }
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

interface paramParseNode {
    param: ParamDefinition;
    parsed?: parsedTypes;
    index: number;
}

//命令解析类
export class commandParser {
    commands: Map<string, Command>;
    constructor() {
        this.commands = new Map();
        chatBus.subscribe(this.runCommand.bind(this));
    }

    /** 注册命令 */
    registerCommand(command: Command) {
        // prettier-ignore
        if (command.name != "help") {
            command.addSubCommand(new Command("help","获取帮助",false,(player, args) => {
                help.handleCommandHelp(player,command);},
            undefined,true));
        }
        this.commands.set(command.name, command);
    }
    /**客户端注册指令 */
    regToHost() {
        if (LibConfig.UUID == undefined) return;
        const obj = [...this.commands.entries()].reduce((obj: any, [key, value]) => ((obj[key] = value), obj), {});
        return exchangedb.edit((data) => {
            data["cmd"][LibConfig.UUID!] = obj;
        });
    }
    /**注册客户端命令(系统调用，不用管) */
    regClientCommand() {
        try {
            const commandObj = exchangedb.get("cmd") as Record<string, Record<string, Command>>;
            for (let commands of Object.values(commandObj)) {
                for (let [name, command] of Object.entries(commands)) {
                    if (!this.commands.has(name)) {
                        command.isClientCommand = true;
                        this.commands.set(name, command);
                    }
                }
            }
        } catch (err) {
            console.warn("命令注册失败");
        }
    }

    /** 运行命令注册回调*/
    runCommand(t: ChatSendBeforeEvent) {
        if (!(t.message.length > 0 && t.message[0] === ".")) return;
        let msg = t.message.slice(1);
        return this.parseCommand(msg, t.sender);
    }

    /**直接解析一条命令 */
    parseCommand(input: string, player: Player) {
        //使用正则分割字符串
        const paramStrings: string[] = [...input.matchAll(/@?(?:"(?:[^"]*)"|(?:[^\s]+))/g)].map((t) => t[0]);
        const [name, ...params] = paramStrings;
        const command = this.commands.get(name);

        if (!LibConfig.isHost && (!command || command.name == "help")) return chatOpe.skipsend; //不是主机，就不能操作命令
        //如果是客户端命令，则让客户端自己处理
        if (command && command.isClientCommand) return chatOpe.skipsend;
        if (!command || (command.isAdmin && !isAdmin(player))) {
            if (!testMode) player.sendMessage(`§c未知的命令: ${name ?? ""}。请检查命令是否存在以及你是否有权限执行它。`);
            return chatOpe.cancel;
        }
        //命中，解析命令
        this.parseSubCommand(command, params, player);
        return chatOpe.cancel;
    }
    /**寻找最深的命令 */
    private findCommand(command: Command, paramStrings: string[]): [Command, number] {
        let current = 0;
        let target = command.subCommands?.find((sub) => sub.name === paramStrings[current]);
        while (target) {
            current++;
            const sub = target.subCommands?.find((sub) => sub.name === paramStrings[current]);
            if (!sub) break;
            target = sub;
        }
        if (!target) target = command;
        return [target, current];
    }
    private parseSubCommand(command: Command, paramStrings: string[], player: Player) {
        //先拿到目标命令
        const [subCommand, current] = this.findCommand(command, paramStrings);
        //权限判断
        if (subCommand.isAdmin && !isAdmin(player)) {
            return commandParser.ErrorMessage(player, command, paramStrings[current], paramStrings, current, "无权限执行此命令");
        }
        //执行命令验证器
        if (subCommand.validator != undefined) {
            const validationResult = subCommand.validator(player);
            if (validationResult !== true) {
                this.ErrorMes(player, validationResult);
                return;
            }
        }
        const params = this.parseParams(command, subCommand, paramStrings, current, player);
        if (params !== undefined) {
            //没有handler说明不需要参数或逻辑在子命令里，但返回了参数，则说明多了
            if (!subCommand.handler) {
                return commandParser.ErrorMessage(player, command, paramStrings[current], paramStrings, current, "子命令错误");
            }
            if (!testMode) subCommand.handler(player, params);
        }
    }

    private parseParams(command: Command, subCommand: Command, params: string[], current: number, player: Player) {
        const paramStrings = params.slice(current);
        //没有参数则返回
        if (subCommand.paramBranches.length == 0) {
            if (paramStrings.length != 0) return commandParser.ErrorMessage(player, command, paramStrings[0], params, current, "多余参数");
            return {};
        }
        //转换后参数对象
        const parsedParamDict: Record<string, parsedTypes> = {};
        interface errorRecord {
            msg: string;
            index: number;
            canReplace: boolean;
        }
        let paramError: errorRecord = { msg: "", index: 0, canReplace: true };
        let success = false;
        const setParamValue = (stack: [paramParseNode, number][]) => {
            // console.warn("转换后stack" + JSON.stringify(stack.map((t) => t[0].parsed)));
            for (let i = 0; i < stack.length; i++) {
                const param = stack[i][0].param;
                const value = stack[i][0].parsed ?? param.default;
                if (value != undefined) parsedParamDict[param.name] = value;
            }
        };
        const updateError = (index: number, error: string, canReplace: boolean = false) => {
            if ((paramError.canReplace && paramError.index == index) || paramError.index < index) {
                paramError = {
                    index: index,
                    msg: error,
                    canReplace: canReplace,
                };
            }
        };
        /**index为当前解析参数开始下标 */
        const check = (T: paramParseNode) => {
            const paramDef = T.param;
            const parser = paramParser[paramDef.type];
            const req = parser.req ?? 1;
            const index = T.index;
            //参数不够了
            if (paramStrings.length < T.index + req) {
                if (paramDef.optional) {
                    if (paramDef.default) T.parsed = paramDef.default;
                    return true;
                } else {
                    return new ParseError("缺少参数", false, T.index + req - paramStrings.length + 1);
                }
            }
            // 先用正则匹配
            const ReqParams = paramStrings.slice(index, index + req);
            let regexArray: RegExpMatchArray | null = null;
            if (parser.regex) {
                regexArray = ReqParams.join(" ").match(parser.regex);
                if (!regexArray) return new ParseError(parser.regexError ?? "regexError", false, 0, true);
            }
            //转换参数
            const parsed = parser.parser(regexArray ?? ReqParams, {
                param: paramDef,
                player: player,
                paramStrings: paramStrings,
                index: index,
            });
            if (parsed instanceof ParseError) {
                return parsed;
            }
            // 执行自定义验证器
            if (paramDef.validator) {
                const validationResult = paramDef.validator(parsed.value, player);
                if (validationResult !== true) {
                    return validationResult instanceof ParseError ? validationResult : new ParseError(validationResult, true);
                }
            }
            T.parsed = parsed.value;
            T.index = index + (parsed.cnt ? parsed.cnt : req) - 1;
            return true;
        };
        const checkSuccess: enterNodeFunc<paramParseNode> = (T: paramParseNode, ctx, stack) => {
            const paramDef = T.param;
            const checkResult = check(T);
            const index = T.index;
            if (checkResult === true) {
                // console.warn("解析成功" + JSON.stringify(T));
                if (!paramDef.subParams?.length) {
                    if (index + 1 < paramStrings.length) {
                        updateError(index, commandParser.BuildErrorMessage(command, params[current + index + 1], params, current + index + 1, "多余参数"));
                        return traverseAct.back;
                    } else {
                        setParamValue([...stack, [T, 0]]);
                        success = true;
                        return traverseAct.break;
                    }
                }
            } else {
                // console.warn("解析失败" + checkResult.msg + checkResult.onlymsg + checkResult.index);
                if (checkResult.onlymsg) {
                    updateError(index + checkResult.index, checkResult.msg ?? "");
                } else {
                    updateError(
                        index + checkResult.index,
                        commandParser.BuildErrorMessage(command, paramStrings[index + checkResult.index], params, current + index + checkResult.index, checkResult.msg),
                        checkResult.canReplace
                    );
                }
                return traverseAct.back;
            }
        };
        //搜索所有参数
        for (const paramDef of subCommand.paramBranches) {
            if (!success)
                PreOrdertraverse<paramParseNode>(
                    { param: paramDef, index: 0 },
                    {
                        getSubNodes: (T) => {
                            return T.param.subParams?.map((t) => {
                                return { param: t, index: T.index + 1 };
                            });
                        },
                        enter: checkSuccess,
                    }
                );
        }
        // console.warn("转化结果" + JSON.stringify(parsedParamDict));
        return success ? parsedParamDict : this.ErrorMes(player, paramError.msg);
    }

    static ErrorMessage(player: Player, command: Command, value: string, params: string[], current: number, tip?: string | undefined) {
        if (!testMode) player.sendMessage("§c" + commandParser.BuildErrorMessage(command, value, params, current, tip));
    }

    private static BuildErrorMessage(command: Command, value: string, params: string[], current: number, tip?: string | undefined) {
        return `语法错误：意外的“${value ?? ""}”：出现在“.${command.name} ${params.slice(0, current).join(" ")} >>${value ?? ""}<< ${params.slice(current + 1).join(" ")}”` + (tip ? `(${tip})` : "");
    }

    private ErrorMes(player: Player, msg: string) {
        if (!testMode) player.sendMessage("§c" + msg);
    }

    getCommandInfo(command: string) {
        return this.commands.get(command);
    }
    getCommandsList(admin: boolean) {
        if (admin) {
            return [...this.commands.keys()];
        } else {
            return [...this.commands.keys()].filter((t) => !this.getCommandInfo(t)?.isAdmin);
        }
    }
}

export const pcommand = new commandParser();
const help = new CommandHelp(pcommand);

const testMode = false;
