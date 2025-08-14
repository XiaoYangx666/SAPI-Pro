import { Player, system } from "@minecraft/server";
import { LibConfig } from "../../Config";
import { chatOpe } from "../../Event";
import { isAdmin, LibErrorMes } from "../../func";
import { Command } from "../commandClass";
import { ParamDefinition, parsedTypes, ParseError } from "../interface";
import { CommandManager } from "../manager";
import { enterNodeFunc, PreOrdertraverse, traverseAct } from "./func";
import { paramParser } from "./ParamTypes";

interface paramParseNode {
    param: ParamDefinition;
    parsed?: parsedTypes;
    index: number;
}

interface errorRecord {
    msg: string;
    index: number;
    canReplace: boolean;
}

//命令解析类
export class CommandParser {
    private manager?: CommandManager;

    init(manager: CommandManager) {
        this.manager = manager;
    }

    /**直接解析一条命令 */
    parseCommand(input: string, player: Player) {
        //使用正则分割字符串
        const paramStrings: string[] = [...input.matchAll(/@?(?:"(?:[^"]*)"|(?:[^\s]+))/g)].map((t) => t[0]);
        const [name, ...params] = paramStrings;
        const command = this.manager?.commands.get(name);

        if (!LibConfig.isHost && (!command || command.name == "help")) return chatOpe.skipsend; //不是主机，就不能操作命令
        //如果是客户端命令，则让客户端自己处理
        if (command && command.isClientCommand) return chatOpe.skipsend;
        if (!command || (command.isAdmin && !isAdmin(player))) {
            if (!this.manager?.testMode)
                player.sendMessage(`§c未知的命令: ${name ?? ""}。请检查命令是否存在以及你是否有权限执行它。`);
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

    parseSubCommand(command: Command, paramStrings: string[], player: Player, showError = true) {
        //先拿到目标命令
        const [subCommand, current] = this.findCommand(command, paramStrings);
        //权限判断
        if (subCommand.isAdmin && !isAdmin(player)) {
            return this.ErrorMessage(
                player,
                command,
                paramStrings[current],
                paramStrings,
                current,
                showError,
                "权限不足，无法执行此命令"
            );
        }
        //执行命令验证器
        if (subCommand.validator != undefined) {
            const validationResult = subCommand.validator(player);
            if (validationResult !== true) {
                return this.ErrorMes(player, validationResult, showError);
            }
        }
        const params = this.parseParams(command, subCommand, paramStrings, current, player, showError);
        if (typeof params == "string") {
            return this.ErrorMes(player, params, showError);
        }
        if (params !== undefined) {
            //没有handler说明不需要参数或逻辑在子命令里，但返回了参数，则说明多了
            if (!subCommand.handler) {
                return this.ErrorMessage(
                    player,
                    command,
                    paramStrings[current],
                    paramStrings,
                    current,
                    showError,
                    "子命令错误"
                );
            }
            if (this.manager?.testMode) return true;
            try {
                system.run(() => {
                    subCommand.handler!(player, params);
                });

                return true;
            } catch (e) {
                LibErrorMes("Command Run Error:" + e + "at" + command.name);
            }
        }
    }

    private parseParams(
        command: Command,
        subCommand: Command,
        params: string[],
        current: number,
        player: Player,
        showError = true
    ) {
        const paramStrings = params.slice(current);
        //没有参数则返回
        if (subCommand.paramBranches.length == 0) {
            if (paramStrings.length != 0)
                return this.BuildErrorMessage(command, paramStrings[0], params, current, "多余参数");
            return {};
        }
        //转换后参数对象
        const parsedParamDict: Record<string, parsedTypes> = {};
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
                    return validationResult instanceof ParseError
                        ? validationResult
                        : new ParseError(validationResult, true);
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
                        updateError(
                            index,
                            this.BuildErrorMessage(
                                command,
                                params[current + index + 1],
                                params,
                                current + index + 1,
                                "多余参数"
                            )
                        );
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
                        this.BuildErrorMessage(
                            command,
                            paramStrings[index + checkResult.index],
                            params,
                            current + index + checkResult.index,
                            checkResult.msg
                        ),
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
        return success ? parsedParamDict : paramError.msg;
    }

    ErrorMessage(
        player: Player,
        command: Command,
        value: string,
        params: string[],
        current: number,
        showError: boolean,
        tip?: string | undefined
    ) {
        if (this.manager?.testMode) return;
        const msg = "§c" + this.BuildErrorMessage(command, value, params, current, tip);
        if (!showError) return msg;
        player.sendMessage(msg);
    }

    private BuildErrorMessage(
        command: Command,
        value: string,
        params: string[],
        current: number,
        tip?: string | undefined
    ) {
        return (
            `语法错误：意外的“${value ?? ""}”：出现在“.${command.name} ${params.slice(0, current).join(" ")} >>${
                value ?? ""
            }<< ${params.slice(current + 1).join(" ")}”` + (tip ? `(${tip})` : "")
        );
    }

    private ErrorMes(player: Player, msg: string, showError: boolean) {
        if (this.manager?.testMode) return;
        if (!showError) return "§c" + msg;
        player.sendMessage("§c" + msg);
    }
}
