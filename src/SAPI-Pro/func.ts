import { Player, system, Vector3, world } from "@minecraft/server";
import { LibConfig, libName } from "./Config";
/**执行命令 */
export function cmd(text: string, async = false): void {
    if (async) {
        system.run(() => world.getDimension("overworld").runCommand(text));
        return;
    }
    world.getDimension("overworld").runCommand(text);
}

export function tointloc(loc: Vector3): [number, number, number] {
    return [Math.floor(loc.x), Math.floor(loc.y), Math.floor(loc.z)];
}
/** 将坐标转为整数 */
export function intloc(loc: Vector3): Vector3 {
    return { x: Math.floor(loc.x), y: Math.floor(loc.y), z: Math.floor(loc.z) };
}
/**数组转Vector3 */
export function ArraytoVector3(locArray: [number, number, number]) {
    return { x: locArray[0], y: locArray[1], z: locArray[2] };
}

export function Vector3toArray(vec: Vector3) {
    return [vec.x, vec.y, vec.z];
}

export function isNum(value: any): boolean {
    return !isNaN(parseFloat(value)) && !isNaN(value);
}

/**
 * 返回玩家是否管理员
 * 默认使用tag区分
 * 你可以自己改
 * */
export function isAdmin(player: Player) {
    return player.hasTag("op");
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
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function distance(pos1: Vector3, pos2: Vector3) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return dx * dx + dy * dy + dz * dz;
}
export function distance_sqrt(pos1: Vector3, pos2: Vector3) {
    return Math.sqrt(distance(pos1, pos2));
}

export const dimName: Record<string, string> = {
    "minecraft:overworld": "§q主世界",
    "minecraft:nether": "§m下界",
    "minecraft:the_end": "§n末地",
};

export function getScoreboardObj(scoreboardName: string) {
    return world.scoreboard.getObjective(scoreboardName) ?? world.scoreboard.addObjective(scoreboardName);
}

/**
 * 给定坐标点，计算其所在区块
 *
 * 返回所在区块的最小点与最大点,y坐标不变
 */
export function calChunk(pos: Vector3): { min: Vector3; max: Vector3 } {
    const cx = Math.floor(pos.x / 16);
    const cz = Math.floor(pos.z / 16);
    const xstart = cx * 16;
    const xend = (cx + 1) * 16 - 1;
    const zstart = cz * 16;
    const zend = (cz + 1) * 16 - 1;
    return { min: { x: xstart, y: pos.y, z: zstart }, max: { x: xend, y: pos.y, z: zend } };
}
export function Vector3Add(vec1: Vector3, vec2: Vector3) {
    return { x: vec1.x + vec2.x, y: vec1.y + vec2.y, z: vec1.z + vec2.z };
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

export function LibError(text: string) {
    console.error(`[${libName}.Error]${LibConfig.packInfo.name}:${text}`);
}
