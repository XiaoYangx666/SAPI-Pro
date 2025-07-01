import { CommandHelp } from "./help";
import { CommandManager } from "./manager";
import { CommandParser } from "./parser/parser";

//初始化
function initCommandSystem() {
    const parser = new CommandParser();
    const pcommand = new CommandManager(parser);
    const help = new CommandHelp(pcommand, parser);
    parser.init(pcommand);
    pcommand.init(help);
    return pcommand;
}

export const pcommand = initCommandSystem();
export { CommandManager } from "./manager";
export { Command } from "./commandClass";
export * from "./interface";
