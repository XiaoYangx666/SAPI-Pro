import { system } from "@minecraft/server";
import { LibConfig } from "../Config";
import { LibMessage } from "../func";

export async function initCom() {
    //稳定版不和其他通信
    await system.waitTicks(5);
    LibConfig.isHost = false;
    const pack = LibConfig.packInfo;
    LibMessage(`已加载模块${pack.name},lib版本:${LibConfig.version}-stable`);
    if (LibConfig.packInfo.greeting) {
        LibMessage(`[${pack.name}]${pack.greeting}`);
    }
}
