import { CustomCommandParamType, Player } from "@minecraft/server";
import { ArraytoVector3, getAllPlayers, rand, Vector3toArray } from "../../func";
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
}

/** 类型映射*/
export const NativeTypeMapping: Record<keyof typeof paramTypes, CustomCommandParamType> = {
    flag: CustomCommandParamType.String,
    boolean: CustomCommandParamType.Boolean,
    enum: CustomCommandParamType.String,
    int: CustomCommandParamType.Integer,
    float: CustomCommandParamType.Float,
    target: CustomCommandParamType.String,
    position: CustomCommandParamType.Location,
    string: CustomCommandParamType.String,
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
            return param.enums?.includes(value[0]) ? new ParseInfo(value[0]) : new ParseError("不在枚举中");
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
            return isNaN(parsedFloat) ? new ParseError("参数不是浮点类型") : new ParseInfo(parsedFloat);
        },
        regex: new RegExp(/^-?( [1-9]\d*\.?\d*)|(0\.\d*[1-9])$/),
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
            if (!name) return new ParseError("没有与选择器匹配的目标", true, 0, false);
            let name1 = name[1] ?? name[2];
            let target: Player | undefined;
            switch (name1) {
                case "s":
                    target = ctx.player;
                    break;
                case "r":
                    const players = getAllPlayers();
                    target = players[rand(0, players.length - 1)];
                    break;
                default:
                    target = getAllPlayers().find((t) => t.name === name1);
            }
            return target ? new ParseInfo(target) : new ParseError("没有与选择器匹配的目标", true, 0, false);
        },
        regex: new RegExp(/^@?(?:"([^"]*)"|((?![\d]+$)[^\s]+))$/),
        regexError: "目标格式错误",
    },
    string: {
        parser(value) {
            return new ParseInfo(value[0]);
        },
        regex: new RegExp(/^[^\x20]+$/),
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
            const playerPosition = Vector3toArray(context.player.location);
            const parsedCoordinates = [];
            for (let i = 0; i < 3; i++) {
                const coordinate = matchResults[i * 3];
                const operator = matchResults[i * 3 + 1];
                const offset = matchResults[i * 3 + 2] ?? 0;
                const offsetValue = parseInt(offset);
                let coordinateValue = coordinate == "~" ? playerPosition[i] : parseInt(coordinate);
                if (operator == "-") {
                    coordinateValue -= offsetValue;
                } else {
                    coordinateValue += offsetValue;
                }
                parsedCoordinates[i] = coordinateValue;
            }
            return new ParseInfo(ArraytoVector3(parsedCoordinates as any), j);
        },
        regex: new RegExp(/^(?:-?\d+|~)\S*$/),
        regexError: "不是坐标格式",
    },
    flag: {
        parser(value, ctx) {
            const param = ctx.param;
            return param.name == value[0] ? new ParseInfo(param.name) : new ParseError("符号不匹配", false, 0, true);
        },
    },
};

const TOKEN_SPLIT_REGEX = /[^~\s)]+|~[^\s~]*/g;
const TOKEN_REGEX = /^(-?\d+|~)(?:(\+|-)?(\d+))?$/;
