import { Player, Vector3 } from "@minecraft/server";
type DPTypes = string | number | boolean | Vector3;
export declare abstract class DataBase<T> {
    static maxChunkBytes: number;
    static DBMap: Record<string, DataBase<any>>;
    name: string;
    type: "DP" | "jSB" | "cSB" | undefined;
    constructor(name: string);
    abstract set(key: string, value: T): void;
    abstract get(key: string): T | undefined;
    abstract rm(key: string): void;
    abstract keys(): string[];
    abstract clear(): void;
    static getDB(name: string): DataBase<any> | undefined;
    static getDBs(): DataBase<any>[];
}
export declare class DPDataBase extends DataBase<DPTypes> {
    private static ListLenMark;
    private static ListMark;
    private keyPrefix;
    constructor(name: string);
    private getKey;
    set(key: string, value: DPTypes): void;
    get(key: string): string | number | boolean | Vector3 | undefined;
    rm(key: string): void;
    getrealKeys(): string[];
    keys(): string[];
    /**以json形式存储一个对象 */
    setJSON(key: string, value: object): void;
    /**获取json形式存储的对象 */
    getJSON(key: string): object | undefined;
    clear(): void;
    private setLargeString;
    private getLargeString;
    private setList;
    private getList;
    private getListLen;
    private rmList;
    static isDPDataBase(db: DataBase<any>): db is DPDataBase;
    static clearAllDP(): void;
    static getByteCount(): number;
    static getAllKeys(): string[];
}
export declare class ScoreBoardJSONDataBase extends DataBase<object> {
    private scoreboardName;
    private data;
    constructor(name: string);
    set(key: string, value: object): void;
    get(key: string): any;
    clear(): void;
    rm(key: string): void;
    keys(): string[];
    private resetScoreBoard;
    private setJSON;
    private getJSON;
    edit(callback: (data: Record<string, any>) => boolean | void | undefined): void;
}
/**虚拟计分项，不一定存在计分板上 */
declare class scoreboardObj {
    private sbObj;
    private name;
    constructor(sbObj: ScoreBoardDataBase, name: string | Player);
    get(): number | undefined;
    set(value: number): void;
    rm(): void;
    isValid(): boolean;
}
export declare class ScoreBoardDataBase extends DataBase<number> {
    private scoreboardName;
    private sb;
    constructor(name: string);
    private getScoreBoard;
    set(key: string | Player, value: number | string): void;
    get(key: string | Player): number | undefined;
    /**获取一个虚拟计分项对象 */
    getObj(key: string | Player): scoreboardObj;
    rm(key: string | Player): void;
    keys(): string[];
    clear(): void;
}
export declare function splitString(input: String, sync?: false): Promise<string[]>;
export declare function splitString(input: String, sync: true): string[];
export declare const sysdb: ScoreBoardDataBase;
export declare const exchangedb: ScoreBoardJSONDataBase;
export declare const Configdb: DPDataBase;
export {};
