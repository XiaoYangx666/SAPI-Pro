import {
    BlockTypes,
    CustomCommandParamType,
    EntityTypes,
    ItemTypes,
    Player,
} from "@minecraft/server";
import { getAllPlayers } from "../../func";
import { RandomUtils, Vector3Utils } from "../../utils/main";
import { ParamDefinition, ParseError, ParseInfo } from "../interface";

export enum paramTypes {
    flag,
    boolean,
    enum,
    int,
    float,
    target,
    position,
    string,
    itemType,
    blockType,
    /**仅支持原生命令使用 */
    player,
    /**仅支持原生命令使用 */
    entity,
    entityType,
}

/** 类型映射*/
export const NativeTypeMapping: Record<keyof typeof paramTypes, CustomCommandParamType> = {
    flag: CustomCommandParamType.Enum,
    boolean: CustomCommandParamType.Boolean,
    enum: CustomCommandParamType.Enum,
    int: CustomCommandParamType.Integer,
    float: CustomCommandParamType.Float,
    target: CustomCommandParamType.PlayerSelector,
    player: CustomCommandParamType.PlayerSelector,
    position: CustomCommandParamType.Location,
    string: CustomCommandParamType.String,
    itemType: CustomCommandParamType.ItemType,
    blockType: CustomCommandParamType.BlockType,
    entity: CustomCommandParamType.EntitySelector,
    entityType: CustomCommandParamType.EntityType,
};

interface parserContext {
    player: Player;
    param: ParamDefinition;
    paramStrings: string[];
    index: number;
}
export interface paramParserDefinition {
    parser: (value: RegExpMatchArray | string[], ctx: parserContext) => ParseInfo | ParseError;
    req?: number;
    regex?: RegExp;
    regexError?: string;
}

export const paramParser: Record<keyof typeof paramTypes, paramParserDefinition> = {
    enum: {
        parser(value, ctx) {
            const param = ctx.param!;
            return param.enums?.includes(value[0])
                ? new ParseInfo(value[0])
                : new ParseError("不在枚举中");
        },
        regex: new RegExp(/^[^\x20]+$/),
    },
    int: {
        parser(value) {
            const parsedInt = parseInt(value[0], 10);
            return isNaN(parsedInt) ? new ParseError("参数不是数字类型") : new ParseInfo(parsedInt);
        },
        regex: new RegExp(/^-?(\d+)$/),
        regexError: "参数非数字",
    },
    float: {
        parser(value) {
            const parsedFloat = parseFloat(value[0]);
            return isNaN(parsedFloat)
                ? new ParseError("参数不是浮点类型")
                : new ParseInfo(parsedFloat);
        },
        regex: new RegExp(/^-?(\d+(\.\d*)?|\.\d+)$/),
    },
    boolean: {
        parser(value) {
            return new ParseInfo(value[0] == "true");
        },
        regex: new RegExp(/^(true|false)$/),
        regexError: "要求布尔类型",
    },
    target: {
        parser(name, ctx) {
            if (!name)
                return new ParseError(
                    { rawtext: [{ translate: "commands.generic.noTargetMatch" }] },
                    true,
                    0,
                    false
                ); //没有与选择器匹配的目标
            let name1 = name[1] ?? name[2];
            let target: Player | undefined;
            switch (name1) {
                case "s":
                    target = ctx.player;
                    break;
                case "r":
                    const players = getAllPlayers();
                    target = RandomUtils.choice(players);
                    break;
                default:
                    target = getAllPlayers().find((t) => t.name === name1);
            }
            return target
                ? new ParseInfo(target)
                : new ParseError(
                      { rawtext: [{ translate: "commands.generic.noTargetMatch" }] },
                      true,
                      0,
                      false
                  );
        },
        regex: new RegExp(/^@?(?:"([^"]*)"|((?![\d]+$)[^\s]+))$/),
        regexError: "目标格式错误",
    },
    string: {
        parser(value) {
            const text = value[0];
            return new ParseInfo(
                text.length >= 2 && text.startsWith('"') && text.endsWith('"')
                    ? text.slice(1, -1)
                    : text
            );
        },
        regex: new RegExp(/^(?:"[^"]*"|[^\x20]+)$/),
    },
    position: {
        parser(value, context) {
            const paramStrings = context.paramStrings.slice(context.index); //截取后面的
            const matchResults = [];
            let i = 0;
            let j = 0;
            while (j < paramStrings.length && i < 3) {
                const splitTokens = paramStrings[j].matchAll(TOKEN_SPLIT_REGEX);
                for (let token of splitTokens) {
                    i++;
                    const val = token[0];
                    const regexMatch = TOKEN_REGEX.exec(val);
                    if (!regexMatch) return new ParseError("坐标格式错误", false, j, false);
                    matchResults.push(...regexMatch.slice(1));
                }
                j++;
            }
            if (i != 3) {
                return new ParseError("缺少坐标", false, j + 1, false);
            }
            const playerPosition = Vector3Utils.toArray(context.player.location);
            const parsedCoordinates = [];
            for (let i = 0; i < 3; i++) {
                const coordinate = matchResults[i * 3];
                const operator = matchResults[i * 3 + 1];
                const offset = matchResults[i * 3 + 2] ?? 0;
                const offsetValue = Number(offset);
                let coordinateValue = coordinate == "~" ? playerPosition[i] : Number(coordinate);
                if (operator == "-") {
                    coordinateValue -= offsetValue;
                } else {
                    coordinateValue += offsetValue;
                }
                parsedCoordinates[i] = coordinateValue;
            }
            return new ParseInfo(Vector3Utils.fromArray(parsedCoordinates as any), j);
        },
        regex: new RegExp(/^(?:-?(?:\d+(?:\.\d*)?|\.\d+)|~)\S*$/),
        regexError: "不是坐标格式",
    },
    flag: {
        parser(value, ctx) {
            const param = ctx.param;
            return param.name == value[0]
                ? new ParseInfo(param.name)
                : new ParseError("符号不匹配", false, 0, true);
        },
    },
    itemType: {
        parser(value) {
            const typeId = value[0].includes(":") ? value[0] : "minecraft:" + value[0];
            const type = ItemTypes.get(typeId);
            return type ? new ParseInfo(type) : new ParseError(`物品类型不存在`);
        },
    },
    blockType: {
        parser(value) {
            const typeId = value[0].includes(":") ? value[0] : "minecraft:" + value[0];
            const type = BlockTypes.get(typeId);
            return type ? new ParseInfo(type) : new ParseError("方块类型不存在");
        },
    },
    player: {
        parser(value, ctx) {
            return new ParseError("不支持解析此类型");
        },
    },
    entity: {
        parser(value, ctx) {
            return new ParseError("不支持解析此类型");
        },
    },
    entityType: {
        parser(value) {
            const type = EntityTypes.get(value[0] as any);
            return type ? new ParseInfo(type) : new ParseError("实体类型不存在");
        },
    },
};

const TOKEN_SPLIT_REGEX = /[^~\s)]+|~[^\s~]*/g;
const TOKEN_REGEX = /^(-?(?:\d+(?:\.\d*)?|\.\d+)|~)(?:(\+|-)?(\d+(?:\.\d*)?|\.\d+))?$/;
