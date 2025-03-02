import { system, world } from "@minecraft/server";
import { Command, pcommand } from "../Command/main";
import { LibConfig } from "../Config";
import { exchangedb } from "../DataBase";
import { LibMessage } from "../func";
//重置脚本信息和命令注册
world.beforeEvents.worldInitialize.subscribe(() => {
    system.run(() => {
        exchangedb.edit((data) => {
            const sinfo = data["scriptsInfo"];
            if (sinfo == undefined || Object.keys(sinfo).length != 0) {
                data["scriptsInfo"] = {};
                data["cmd"] = {};
                data["Host"] = undefined;
                return true;
            }
            return false;
        });
    });
});
world.afterEvents.worldInitialize.subscribe(async () => {
    //设定自己信息
    LibConfig.isHost = false;
    if (LibConfig.forceHost)
        LibConfig.version = 999;
    exchangedb.edit((data) => {
        data["scriptsInfo"][LibConfig.UUID] = { version: LibConfig.version, info: LibConfig.packInfo };
    });
    LibMessage(`已加载模块${LibConfig.packInfo.name},lib版本:${LibConfig.version}`);
    await elect_Host();
    if (!LibConfig.isHost) {
        pcommand.regToHost();
    }
    else {
        await system.waitTicks(5);
        pcommand.regClientCommand();
        regSysCommand();
    }
});
export async function elect_Host() {
    await system.waitTicks(5);
    const packs = exchangedb.get("scriptsInfo");
    let max = LibConfig.version;
    Object.entries(packs).forEach((t) => {
        max = t[1].version > max ? t[1].version : max;
    });
    if (LibConfig.version >= max) {
        exchangedb.edit((data) => {
            if (data["Host"] != undefined)
                return false;
            data["Host"] = LibConfig.UUID;
            LibConfig.isHost = true;
            LibMessage(`主模块:${LibConfig.packInfo.name}`);
        });
    }
}
function regSysCommand() {
    pcommand.registerCommand(new Command("sysinfo", "显示SAPI-Pro系统信息", false, (player, params) => {
        player.sendMessage(`\n§6=== §bSAPI-Pro §6| §a版本: ${LibConfig.version} §6===`);
        player.sendMessage(`§e* §f主模块: §a${LibConfig.packInfo.name}`);
        player.sendMessage(`§e* §f已注册命令: §c${pcommand.commands.size} 条`);
        player.sendMessage(`§e* §f已加载模块: §d${Object.keys(exchangedb.get("scriptsInfo")).length} 个`);
        player.sendMessage(`§7------------------------------------------`);
    }));
}
