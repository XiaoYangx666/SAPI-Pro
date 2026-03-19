import { Player, PlayerPermissionLevel, system, world } from "@minecraft/server";
import { Dimensions } from "./constants";
import { LibLogger } from "./utils/logger";
/**执行命令 (维度:主世界) */
export function cmd(text: string, async = false): void {
    if (async) {
        system.run(() => Dimensions.Overworld.runCommand(text));
        return;
    }
    Dimensions.Overworld.runCommand(text);
}

/**
 * 返回玩家是否管理员
 * 默认使用权限等级判断
 * */
export function isAdmin(player: Player) {
    return player.playerPermissionLevel == PlayerPermissionLevel.Operator;
}

/**安全获取所有玩家 */
export function getAllPlayers() {
    return world.getAllPlayers().filter((t) => t != undefined);
}
/**根据玩家id获取玩家 */
export function getPlayerById(id: string) {
    return getAllPlayers().find((t) => t.id == id);
}
/**根据玩家名获取玩家 */
export function getPlayerByName(name: string) {
    return getAllPlayers().find((t) => t.name == name);
}

export function generateUUID() {
    var d = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = ((d + Math.random() * 16) % 16) | 0;
        d = Math.floor(d / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
}

export function LibMessage(text: string) {
    LibLogger.log(text);
}

export function LibErrorMes(message: string, e?: unknown) {
    LibLogger.error(message, e);
}
