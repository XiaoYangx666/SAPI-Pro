import { world } from "@minecraft/server";
import { LibConfig, PackInfo } from "./Config";
import "./System/ScriptCom";
import { initCom } from "./System/ScriptCom";
import { setLoggerNamespace } from "./utils/logger";
import "./Deferred/index";

//引用此文件
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
    setLoggerNamespace(packInfo.nameSpace);
    world.afterEvents.worldLoad.subscribe(initCom);
}
