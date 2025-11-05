import { CommandPermissionLevel, Player, system, Vector3, world } from "@minecraft/server";
import { LibConfig, libName } from "./Config";
import { Dimensions } from "./constants";
import { ChunkUtils } from "./utils/chunkUtils";
import { RandomUtils } from "./utils/random";
import { Vector3Utils } from "./utils/vector";

/**执行命令 */
export function cmd(text: string, async = false): void {
    if (async) {
        system.run(() => Dimensions.Overworld.runCommand(text));
        return;
    }
    Dimensions.Overworld.runCommand(text);
}

export function tointloc(loc: Vector3): [number, number, number] {
    return Vector3Utils.toArray(Vector3Utils.intLoc(loc));
}

/** 将坐标转为整数 */
export function intloc(loc: Vector3): Vector3 {
    return Vector3Utils.intLoc(loc);
}
/**数组转Vector3 */
export function ArraytoVector3(locArray: [number, number, number]) {
    return Vector3Utils.fromArray(locArray);
}

export function Vector3toArray(vec: Vector3) {
    return Vector3Utils.toArray(vec);
}

export function isNum(value: any): boolean {
    return !isNaN(parseFloat(value)) && !isNaN(value);
}

/**
 * 返回玩家是否管理员
 * 默认使用权限等级判断
 * */
export function isAdmin(player: Player) {
    return player.commandPermissionLevel >= CommandPermissionLevel.GameDirectors;
}

export function getAllPlayers() {
    return world.getAllPlayers().filter((t) => t != undefined);
}
export function getPlayerById(id: string) {
    return getAllPlayers().find((t) => t.id == id);
}
export function getPlayerByName(name: string) {
    return getAllPlayers().find((t) => t.name == name);
}

/**生成随机数∈[min,max] */
export function rand(min: number = 0, max: number) {
    return RandomUtils.intRange(min, max);
}

export function distance(pos1: Vector3, pos2: Vector3) {
    return Vector3Utils.squaredDistance(pos1, pos2);
}

export function distance_sqrt(pos1: Vector3, pos2: Vector3) {
    return Vector3Utils.distance(pos1, pos2);
}

/**
 * 给定坐标点，计算其所在区块
 *
 * 返回所在区块的最小点与最大点,y坐标不变
 */
export function calChunk(pos: Vector3): { min: Vector3; max: Vector3 } {
    const max = ChunkUtils.getChunkMaxPos(pos);
    const min = ChunkUtils.getChunkMinPos(pos);
    return { min: { x: min.x, y: pos.y, z: min.z }, max: { x: max.x, y: pos.y, z: max.z } };
}
export function Vector3Add(vec1: Vector3, vec2: Vector3) {
    return Vector3Utils.add(vec1, vec2);
}

export function generateUUID() {
    var d = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
}

export function LibMessage(text: string) {
    console.log(`[${libName}]${text}`);
}

export function LibErrorMes(text: string) {
    console.error(`[${libName}.Error]${LibConfig.packInfo.name}:${text}`);
}
