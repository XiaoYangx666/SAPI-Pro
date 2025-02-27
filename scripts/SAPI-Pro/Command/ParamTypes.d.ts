import { Player } from "@minecraft/server";
import { ParamDefinition, ParseError, ParseInfo } from "./main";
export declare enum paramTypes {
    flag = 0,
    boolean = 1,
    enum = 2,
    int = 3,
    float = 4,
    target = 5,
    position = 6,
    string = 7
}
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
export declare const paramParser: Record<string, paramParserDefinition>;
export {};
