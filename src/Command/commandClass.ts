import {
    CommandPermissionLevel,
    CustomCommand,
    CustomCommandParameter,
    CustomCommandParamType,
} from "@minecraft/server";
import {
    commandHandler,
    CommandObject,
    CommandValidator,
    paramBranches,
    ParamDefinition,
} from "./interface";
import { NativeTypeMapping, paramTypes } from "./parser/ParamTypes";
import { LibConfig } from "@/Config";

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

    setHandler(handler: commandHandler) {
        this.handler = handler;
        return this;
    }

    setValidator(validator: CommandValidator) {
        this.validator = validator;
        return this;
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

    /**转换为原生命令以便注册(内部调用) */
    toNative(nameSpace: string) {
        const branch = this.getFlatBranch(nameSpace);
        return {
            cmd: {
                cheatsRequired: false,
                description: this.explain,
                name: `${nameSpace}:${this.name}`,
                permissionLevel: this.isAdmin
                    ? CommandPermissionLevel.GameDirectors
                    : CommandPermissionLevel.Any,
                mandatoryParameters: branch.mandatory,
                optionalParameters: branch.optional,
            },
            // 将收集好的枚举字典抛出
            enums: branch.enums,
        };
    }

    /**获取一条参数 */
    private getFlatBranch(nameSpace: string) {
        const branch: CustomCommandParameter[] = [];
        const optional: CustomCommandParameter[] = [];
        const enums: Record<string, string[]> = {};

        let t = this.paramBranches[0];
        let enumIndex = 0;

        while (t != undefined) {
            const isEnum = t.type === "enum" || t.type === "flag";

            const enumName = isEnum
                ? `${nameSpace}:${this.name}_${t.name}_${enumIndex++}`
                : undefined;

            const param: CustomCommandParameter & { enumName?: string } = {
                name: t.name,
                type: NativeTypeMapping[t.type],
            };

            if (enumName) {
                param.enumName = enumName;

                if (t.type === "enum" && t.enums != undefined) {
                    enums[enumName] = t.enums;
                } else if (t.type === "flag") {
                    enums[enumName] = [t.name];
                }
            }

            if (t.optional) {
                optional.push(param);
            } else {
                branch.push(param);
            }

            if (!t.subParams) break;
            t = t.subParams[0];
        }

        return { mandatory: branch, optional: optional, enums: enums };
    }
}
