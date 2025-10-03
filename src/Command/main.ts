import { CommandManager } from "./manager";
import { CommandParser } from "./parser/parser";

//初始化
function initCommandSystem() {
    const parser = new CommandParser();
    const pcommand = new CommandManager(parser);
    parser.init(pcommand);
    return pcommand;
}

export const pcommand = initCommandSystem();
export { Command } from "./commandClass";
export * from "./interface";
export { CommandManager } from "./manager";
