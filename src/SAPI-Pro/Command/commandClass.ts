import { CommandPermissionLevel, CustomCommand, CustomCommandParameter } from "@minecraft/server";
import {
    commandHandler,
    CommandValidator,
    ParamDefinition,
    paramBranches,
    CommandObject,
    parsedTypes,
} from "./interface";
import { NativeTypeMapping, paramTypes } from "./parser/ParamTypes";

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
    constructor(
        name: string,
        explain: string,
        isAdmin: boolean,
        handler?: commandHandler,
        validator?: CommandValidator,
        isHidden = false,
        isClient = false
    ) {
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
        const command = new Command(
            obj.name,
            obj.explain,
            obj.isAdmin ?? false,
            obj.handler,
            obj.validator,
            obj.isHiden,
            obj.isClientCommand
        );
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

    toNative(nameSpace: string): CustomCommand {
        const branch = this.getFlatBranch();
        return {
            cheatsRequired: false,
            description: this.explain,
            name: `${nameSpace}:${this.name}`,
            permissionLevel: this.isAdmin ? CommandPermissionLevel.GameDirectors : CommandPermissionLevel.Any,
            mandatoryParameters: branch.mandatory,
            optionalParameters: branch.optional,
        };
    }

    /**获取一条参数 */
    getFlatBranch() {
        const branch: CustomCommandParameter[] = [];
        const optional: CustomCommandParameter[] = [];
        let t = this.paramBranches[0];
        while (t != undefined) {
            const param = { name: t.name, type: NativeTypeMapping[t.type] };
            if (t.optional) {
                optional.push(param);
            } else {
                branch.push(param);
            }
            if (!t.subParams) break;
            t = t.subParams[0];
        }
        return { mandatory: branch, optional: optional };
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
