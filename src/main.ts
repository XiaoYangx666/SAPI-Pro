import { world } from "@minecraft/server";
import { LibConfig, PackInfo } from "./Config";
import { initCom } from "./System/ScriptCom";
import { initLangCmd } from "./main";
import { setLoggerNamespace } from "./utils/logger";
export * from "./Command/main";
export * from "./DataBase/index";
export * as Event from "./Event";
export * from "./Form/main";
export * as Func from "./func";
export { PackInfo } from "./Config";
export * from "./utils/main";
export * from "./Translate/index";

/**库初始化 */
export function initSAPIPro(packInfo: PackInfo) {
    LibConfig.regPackInfo(packInfo);
    initLangCmd();
    setLoggerNamespace(LibConfig.packInfo.nameSpace);
    world.afterEvents.worldLoad.subscribe(initCom);
}
