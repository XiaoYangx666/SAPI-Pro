import { CommandHelp } from "./help";
import { CommandManager } from "./manager";
import { NativeCommandParser } from "./parser/nativeParser";
import { CommandParser } from "./parser/parser";
import { chatBus } from "../Event/chatBus";

//初始化
function initCommandSystem() {
    // 模拟命令解析器与自定义 help（.help）仅 beta 渠道存在；stable 渠道 __BETA__=false 时整段死代码消除，
    // parser.ts / help.ts 不进入产物。stable 只注册游戏原生命令，自定义 help 由游戏自带 /help 覆盖
    const parser = __BETA__ ? new CommandParser() : undefined;
    const nativeParser = new NativeCommandParser();
    const pcommand = new CommandManager(parser, nativeParser);
    const help = __BETA__ ? new CommandHelp(pcommand, parser) : undefined;
    parser?.init(pcommand);
    pcommand.init(help);
    // 聊天触发的模拟命令接线：仅 beta 渠道订阅 chatBus（__BETA__=false 时整段死代码消除，
    // 且 chatBus 模块被 stable 的 treeshake.moduleSideEffects 声明为无副作用，整个实例不进 stable 产物）
    if (__BETA__) chatBus.subscribe(pcommand.runCommand.bind(pcommand));
    return pcommand;
}

export const pcommand = initCommandSystem();
export { CommandManager } from "./manager";
export * from "./commandClass";
export * from "./interface";
