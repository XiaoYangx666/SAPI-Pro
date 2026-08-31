import {
    BlockType,
    CustomCommandOrigin,
    CustomCommandResult,
    CustomCommandStatus,
    Entity,
    EntityType,
    ItemType,
    RawMessage,
} from "@minecraft/server";
import { ParamDefinition, parsedTypes, ParseError } from "../interface";
import { Player } from "@minecraft/server"; // 请根据实际依赖调整
import { Command } from "../commandClass";

export class NativeCommandParser {
    parseAndExecute(command: Command, player: Player, args: any[]): CustomCommandResult {
        // 1. 命令级别验证器
        if (command.validator) {
            const validResult = command.validator(player);
            if (validResult !== undefined) {
                return {
                    status: CustomCommandStatus.Failure,
                    message:
                        typeof validResult === "string" ? validResult : parseRawText(validResult),
                };
            }
        }

        let t: ParamDefinition | undefined = command.paramBranches?.[0];
        let i = 0;
        const parsedObject: Record<string, parsedTypes> = {};

        while (t !== undefined) {
            // 如果玩家传了该位置的参数，就取出来；否则视为 undefined
            const rawArg = i < args.length ? args[i] : undefined;

            try {
                // 解析基础类型（内部已做严格类型校验，未传则返回 undefined）
                let parsedValue = this.parseSingleParam(t, rawArg);

                // 2. 处理可选参数的默认值：玩家没传，但配置了 default
                if (parsedValue === undefined && t.default !== undefined) {
                    parsedValue = t.default;
                }

                // 3. 严格校验必填项：既没有玩家输入，也没有默认值，且不是可选参数
                if (parsedValue === undefined && !t.optional) {
                    return {
                        status: CustomCommandStatus.Failure,
                        message: `缺少必填参数: '${t.name}'`,
                    };
                }

                // 4. 执行参数验证器 (ParamValidator)
                if (parsedValue !== undefined && t.validator) {
                    const paramValidResult = t.validator(parsedValue, player);
                    if (paramValidResult !== undefined) {
                        const error =
                            paramValidResult instanceof ParseError
                                ? paramValidResult.msg
                                : paramValidResult;
                        return {
                            status: CustomCommandStatus.Failure,
                            message: parseRawText(error),
                        };
                    }
                }

                // 5. 只要最终有值（玩家输入的或默认值），就塞进字典
                if (parsedValue !== undefined) {
                    parsedObject[t.name] = parsedValue;
                }
            } catch (error) {
                return {
                    status: CustomCommandStatus.Failure,
                    message: `参数 '${t.name}' 解析出错: ${error}`,
                };
            }

            // 💡 只有当成功消耗了一个原生的 args 参数时，索引才向后移动
            if (i < args.length) {
                i++;
            }

            // 步进到下一个参数定义
            t = t.subParams?.[0];
        }

        // 6. 循环结束后，如果 i 还没达到 args.length，说明玩家输入的内容比定义的参数还要多
        if (i < args.length) {
            return { status: CustomCommandStatus.Failure, message: "传入了多余的参数" };
        }

        // 7. 触发 handler 处理器
        if (command.handler) {
            command.handler(player, parsedObject);
        }

        return {
            status: CustomCommandStatus.Success,
        };
    }

    parseSingleParam(param: ParamDefinition, arg: any): parsedTypes {
        if (arg === undefined) return undefined as any;

        switch (param.type) {
            case "int":
                // 必须是数字类型，且必须是整数
                if (typeof arg !== "number" || !Number.isInteger(arg)) {
                    throw new Error(`应为整数(int)，实际收到: ${typeof arg} (${arg})`);
                }
                return arg;
            case "float":
                // 必须是数字类型，且不能是 NaN
                if (typeof arg !== "number" || Number.isNaN(arg)) {
                    throw new Error(`应为浮点数(float)，实际收到: ${typeof arg} (${arg})`);
                }
                return arg;
            case "boolean":
                if (typeof arg !== "boolean") {
                    throw new Error(`应为布尔值(boolean)，实际收到: ${typeof arg} (${arg})`);
                }
                return arg;
            case "string":
                if (typeof arg !== "string") {
                    throw new Error(`应为字符串(string)，实际收到: ${typeof arg} (${arg})`);
                }
                return arg;
            case "enum":
                if (typeof arg !== "string") {
                    throw new Error(`应为枚举字符串(enum)，实际收到: ${typeof arg} (${arg})`);
                }
                if (param.enums && !param.enums.includes(arg)) {
                    throw new Error(
                        `未知的枚举值 '${arg}'。有效值应为: [${param.enums.join(", ")}]`
                    );
                }
                return arg;
            case "flag":
                if (typeof arg !== "string") {
                    throw new Error(`应为标记字符串(flag)，实际收到: ${typeof arg} (${arg})`);
                }
                return arg;
            case "target": // 兼容你不同地方写出的选择器别名
                // 原生选择器返回 Player[]
                if (!Array.isArray(arg) || !arg.every((p) => p instanceof Player)) {
                    throw new Error(`应为玩家选择器结果(Player[])，实际收到非法数组或对象`);
                }
                if (arg.length > 1) {
                    throw new Error("不得选择多个玩家");
                }
                return arg[0];
            case "player":
                if (!Array.isArray(arg) || !arg.every((p) => p instanceof Player)) {
                    throw new Error(`应为玩家选择器结果(Player[])，实际收到非法数组或对象`);
                }
                return arg;
            case "entity":
                // 原生实体选择器返回 Entity[]
                if (!Array.isArray(arg) || !arg.every((e) => e instanceof Entity)) {
                    throw new Error(`应为实体选择器结果(Entity[])，实际收到非法数组或对象`);
                }
                return arg;
            case "position":
                // 校验是否符合 Vector3 对象的结构特征 {x: number, y: number, z: number}
                if (
                    typeof arg !== "object" ||
                    arg === null ||
                    typeof arg.x !== "number" ||
                    typeof arg.y !== "number" ||
                    typeof arg.z !== "number"
                ) {
                    throw new Error(`应为坐标对象(Vector3)，实际收到非法结构`);
                }
                return arg;
            case "blockType":
                if (!(arg instanceof BlockType)) {
                    throw new Error(
                        `应为 BlockType 实例，实际收到: ${arg?.constructor?.name || typeof arg}`
                    );
                }
                return arg;
            case "itemType":
                if (!(arg instanceof ItemType)) {
                    throw new Error(
                        `应为 ItemType 实例，实际收到: ${arg?.constructor?.name || typeof arg}`
                    );
                }
                return arg;
            case "entityType":
                if (!(arg instanceof EntityType)) {
                    throw new Error(
                        `应为 EntityType 实例，实际收到: ${arg?.constructor?.name || typeof arg}`
                    );
                }
                return arg;
            default:
                throw new Error(`未知的参数解析类型: ${param.type}`);
        }
    }
}

function parseRawText(input: string | RawMessage | RawMessage[] | undefined): string {
    if (typeof input == "string") return input;
    if (!input) return "";

    // 1. 如果传入的是数组，遍历并递归解析每一项
    if (Array.isArray(input)) {
        return input.map((item) => parseRawText(item)).join("");
    }

    let result = "";

    // 2. 如果存在 text 字段，直接拼接
    if (typeof input.text === "string") {
        result += input.text;
    }

    // 3. 如果存在 translate 字段，直接拼接原标识符字符串（忽略 with 参数）
    if (typeof input.translate === "string") {
        result += input.translate;
    }

    // 4. 如果存在嵌套的 rawtext，进行多重嵌套递归解析
    if (input.rawtext && Array.isArray(input.rawtext)) {
        result += parseRawText(input.rawtext);
    }

    return result;
}
