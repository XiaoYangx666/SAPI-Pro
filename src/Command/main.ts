import { CommandHelp } from "./help";
import { CommandManager } from "./manager";
import { NativeCommandParser } from "./parser/nativeParser";
import { CommandParser } from "./parser/parser";

//初始化
function initCommandSystem() {
    const parser = new CommandParser();
    const nativeParser = new NativeCommandParser();
    const pcommand = new CommandManager(parser, nativeParser);
    const help = new CommandHelp(pcommand, parser);
    parser.init(pcommand);
    pcommand.init(help);
    return pcommand;
}

export const pcommand = initCommandSystem();
export { CommandManager } from "./manager";
export * from "./commandClass";
export * from "./interface";
