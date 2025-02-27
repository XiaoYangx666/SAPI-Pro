import { system, world } from "@minecraft/server";
import { pcommand } from "../Command/main";
import { LibConfig } from "../Config";
import { exchangedb } from "../DataBase";
import { LibMessage } from "../func";

//重置脚本信息和命令注册
world.beforeEvents.worldInitialize.subscribe(() => {
    system.run(() => {
        exchangedb.edit((data) => {
            const sinfo = data["scriptsInfo"] as object;
            if (sinfo == undefined || Object.keys(sinfo).length != 0) {
                data["scriptsInfo"] = {};
                data["cmd"] = {};
                return true;
            }
            return false;
        });
    });
});

world.afterEvents.worldInitialize.subscribe(async () => {
    //设定自己信息
    LibConfig.isHost = false;
    if (LibConfig.forceHost) LibConfig.version = 999;
    exchangedb.edit((data) => {
        data["scriptsInfo"][LibConfig.UUID] = LibConfig.version;
    });
    LibMessage(`已加载模块${LibConfig.packInfo.name},lib版本:${LibConfig.version}`);
    await elect_Host();
    if (!LibConfig.isHost) {
        pcommand.regToHost();
    } else {
        await system.waitTicks(5);
        pcommand.regClientCommand();
    }
});

export async function elect_Host() {
    await system.waitTicks(5);
    const infos = exchangedb.get("scriptsInfo") as Record<string, number>;
    let max = LibConfig.version;
    Object.entries(infos).forEach((t) => {
        max = t[1] > max ? t[1] : max;
    });
    if (LibConfig.version >= max) {
        exchangedb.edit((data) => {
            if (data["scriptsInfo"]["Host"] != undefined) return false;
            data["scriptsInfo"]["Host"] = LibConfig.UUID;
            LibConfig.isHost = true;
            LibMessage(`主模块:${LibConfig.packInfo.name}`);
        });
    }
}
