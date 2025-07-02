import { system, world } from "@minecraft/server";
import { pcommand } from "SAPI-Pro/main";
import { LibConfig, PackInfo } from "../Config";
import { exchangedb } from "../DataBase";
import { LibMessage } from "../func";
import { regSysInfo } from "./sysinfo";

world.afterEvents.worldLoad.subscribe(async () => {
    //重置脚本信息和命令注册
    exchangedb.edit((data) => {
        const sinfo = data["scriptsInfo"] as object;
        if (sinfo == undefined || Object.keys(sinfo).length != 0) {
            data["scriptsInfo"] = {};
            data["cmd"] = {};
            data["Host"] = undefined;
            return true;
        }
        return false;
    });
    await system.waitTicks(5);
    //设定自己信息
    LibConfig.isHost = false;
    if (LibConfig.forceHost) LibConfig.version = 999;
    exchangedb.edit((data) => {
        data["scriptsInfo"][LibConfig.UUID] = { version: LibConfig.version, info: LibConfig.packInfo } as packComInfo;
    });
    const pack = LibConfig.packInfo;
    LibMessage(`已加载模块${pack.name},lib版本:${LibConfig.version}`);
    if (LibConfig.packInfo.greeting) {
        LibMessage(`[${pack.name}]${pack.greeting}`);
    }

    //选举主机
    await elect_Host();
    if (!LibConfig.isHost) {
        pcommand.regToHost();
    } else {
        await system.waitTicks(5);
        pcommand.regClientCommand();
        regSysInfo();
    }
});

export async function elect_Host() {
    await system.waitTicks(5);
    const packs = exchangedb.get("scriptsInfo") as Record<string, packComInfo>;
    let max = LibConfig.version;
    Object.entries(packs).forEach((t) => {
        max = t[1].version > max ? t[1].version : max;
    });
    if (LibConfig.version >= max) {
        exchangedb.edit((data) => {
            if (data["Host"] != undefined) return false;
            data["Host"] = LibConfig.UUID;
            LibConfig.isHost = true;
            LibMessage(`主模块:${LibConfig.packInfo.name}`);
        });
    }
}

export interface packComInfo {
    version: number;
    info: PackInfo;
}
