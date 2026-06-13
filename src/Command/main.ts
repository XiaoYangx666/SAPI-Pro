import { CommandManager } from "./manager";
import { NativeCommandParser } from "./parser/nativeParser";

//初始化
function initCommandSystem() {
    const nativeParser = new NativeCommandParser();
    const pcommand = new CommandManager(nativeParser);
    return pcommand;
}

export const pcommand = initCommandSystem();
export { CommandManager } from "./manager";
export * from "./commandClass";
export * from "./interface";
