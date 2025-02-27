import { Player, Vector3 } from "@minecraft/server";
export declare function cmd(text: string, async?: boolean): void;
export declare function tointloc(loc: Vector3): [number, number, number];
/** 将坐标转为整数 */
export declare function intloc(loc: Vector3): Vector3;
/**数组转Vector3 */
export declare function ArraytoVector3(locArray: [number, number, number]): {
    x: number;
    y: number;
    z: number;
};
export declare function Vector3toArray(vec: Vector3): number[];
export declare function isNum(value: any): boolean;
export declare function isAdmin(player: Player): boolean;
export declare function getAllPlayers(): Player[];
export declare function getPlayerById(id: string): Player | undefined;
export declare function getPlayerByName(name: string): Player | undefined;
/**生成随机数∈[min,max] */
export declare function rand(min: number | undefined, max: number): number;
export declare function distance(pos1: Vector3, pos2: Vector3): number;
export declare function distance_sqrt(pos1: Vector3, pos2: Vector3): number;
export declare const dimName: Record<string, string>;
export declare function getScoreboardObj(scoreboardName: string): import("@minecraft/server").ScoreboardObjective;
/**
 * 给定坐标点，计算其所在区块
 *
 * 返回所在区块的最小点与最大点,y坐标不变
 */
export declare function calChunk(pos: Vector3): {
    min: Vector3;
    max: Vector3;
};
export declare function Vector3Add(vec1: Vector3, vec2: Vector3): {
    x: number;
    y: number;
    z: number;
};
export declare function generateUUID(): string;
export declare function LibMessage(text: string): void;
