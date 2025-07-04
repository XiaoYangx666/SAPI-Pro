import { world } from "@minecraft/server";
import { LibConfig, PackInfo } from "./Config";
import "./System/ScriptCom";
import { initCom } from "./System/ScriptCom";

//引用此文件
export * from "./Command/main";
export { Configdb, DataBase, DPDataBase, exchangedb, ScoreBoardDataBase, ScoreBoardJSONDataBase } from "./DataBase";
export * as Event from "./Event";
export * from "./Form/main";
export * as Func from "./func";
export { PackInfo } from "./Config";

/**库初始化 */
export function initSAPIPro(packInfo: PackInfo) {
    LibConfig.regPackInfo(packInfo);
    world.afterEvents.worldLoad.subscribe(initCom);
}
