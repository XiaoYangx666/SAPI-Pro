import {
    DisplaySlotId,
    Entity,
    ScoreboardIdentity,
    ScoreboardObjective,
    system,
    Vector3,
    world,
} from "@minecraft/server";
import { cmd } from "../func";
import { Logger } from "../utils/logger";

export type DPValueTypes = string | number | boolean | Vector3;
export type DBTypes = "DP" | "jSB" | "cSB";
export type ValueGuard<T> = (val: unknown) => val is T;

export abstract class DataBase<T> {
    static maxChunkBytes = 32767;
    static DBMap: Record<string, DataBase<any>> = {}; //存储所有注册过的数据库
    public name: string; //数据库名
    public type: DBTypes; //数据库类型(SB不是骂人)

    constructor(name: string, type: DBTypes) {
        this.name = name;
        this.type = type;
        //注册数据库
        DataBase.DBMap[name] = this;
    }

    abstract set(key: string, value: T): void;
    abstract get(key: string): T | undefined;
    abstract rm(key: string): void;
    abstract keys(): string[];
    abstract clear(): void;
    static getDB(name: string): DataBase<any> | undefined {
        return this.DBMap[name];
    }
    static getDBs(): DataBase<any>[] {
        return Object.values(this.DBMap);
    }
}
export class DPDataBase extends DataBase<DPValueTypes> {
    private static ListLenMark = "arrlen";
    private static ListMark = "arr";

    private keyPrefix: string; //前缀
    private readonly re: RegExp;
    private readonly logger: Logger;

    constructor(name: string) {
        super(name, "DP");
        this.keyPrefix = this.name;
        this.logger = new Logger(`${DPDataBase.name}_${name}`);
        this.re = new RegExp(`^${this.keyPrefix}\.([^_]+)_(?:$|${DPDataBase.ListLenMark})`);
    }
    private getKey(key: string, mark: string = "", index?: number) {
        return `${this.keyPrefix}.${key}_${mark}${index ?? ""}`;
    }
    /**
     * 设置值（同步）
     * - 小数据直接写入
     * - 大字符串同步分片写入（可能造成卡顿）
     */
    set(key: string, value: DPValueTypes) {
        if (typeof value == "string" && checkBytes(value)) {
            const splitStrings = splitString(value, true);
            this.setList(key, splitStrings);
        } else {
            world.setDynamicProperty(this.getKey(key), value);
        }
    }

    /**
     * 设置值（异步）
     * - 小数据直接写入
     * - 大字符串异步分片写入（避免卡顿）
     */
    async setAsync(key: string, value: DPValueTypes) {
        if (typeof value === "string" && checkBytes(value)) {
            const splitStrings = await splitString(value);
            this.setList(key, splitStrings);
        } else {
            world.setDynamicProperty(this.getKey(key), value);
        }
    }

    get<T extends DPValueTypes = DPValueTypes>(key: string): T | undefined {
        let value: DPValueTypes | undefined;
        if (this.getListLen(key) != undefined) {
            value = this.getLargeString(key);
        } else {
            value = world.getDynamicProperty(this.getKey(key));
        }
        return value as T;
    }

    rm(key: string) {
        if (this.getListLen(key) != undefined) {
            this.rmList(key);
        } else {
            world.setDynamicProperty(this.getKey(key));
        }
    }
    /**获取所有键，包括list的的键,并保留DP前缀 */
    getrealKeys() {
        return world.getDynamicPropertyIds().filter((t) => t.startsWith(this.keyPrefix));
    }
    /**获取所有键 */
    keys() {
        const keys = this.getrealKeys()
            .filter((t) => this.re.test(t))
            .map((t) => t.match(this.re)?.[1] ?? "");
        return keys;
    }

    entries(): [string, DPValueTypes | undefined][] {
        const keys = this.keys();
        const entires: [string, DPValueTypes | undefined][] = keys.map((key) => [
            key,
            this.get(key),
        ]);
        return entires;
    }
    /**以json形式存储一个对象 */
    async setJSON(key: string, value: object) {
        const data = JSON.stringify(value);
        await this.setAsync(key, data);
    }
    /**
     * 获取JSON形式存储的对象，可选使用类型守卫进行校验
     * @param key 键名
     * @param guard 可选类型守卫函数
     * @returns 解析后的数据，失败或校验不通过返回 undefined
     */
    getJSON<T = unknown>(key: string, guard?: ValueGuard<T>): T | undefined {
        const data = this.get(key);
        if (data === undefined) return;
        if (typeof data !== "string") return;
        try {
            const parsed: unknown = JSON.parse(data);
            if (guard) {
                return guard(parsed) ? parsed : undefined;
            }
            return parsed as T;
        } catch {
            this.logger.warn(`获取json失败,key:${key},原始数据:${data.slice(0, 100)}`);
            return undefined;
        }
    }
    clear() {
        const keys = this.getrealKeys();
        for (let key of keys) {
            world.setDynamicProperty(key);
        }
    }
    private getLargeString(key: string) {
        return this.getList(key)?.join("");
    }
    private setList(key: string, list: string[]) {
        const lenKey = this.getKey(key, DPDataBase.ListLenMark);
        const oldLength = world.getDynamicProperty(lenKey);
        //设置数组长度
        world.setDynamicProperty(lenKey, list.length);
        //设置数组每一项
        for (let i = 0; i < list.length; i++) {
            world.setDynamicProperty(this.getKey(key, DPDataBase.ListMark, i), list[i]);
        }
        //如果oldLength大于数组长度，要删除多余的
        if (typeof oldLength == "number" && oldLength > list.length) {
            for (let i = list.length; i < oldLength; i++) {
                world.setDynamicProperty(this.getKey(key, DPDataBase.ListMark, i));
            }
        }
    }
    private getList(key: string) {
        const length = this.getListLen(key);
        if (length == undefined) return;
        const data: string[] = new Array(length);
        for (let i = 0; i < length; i++) {
            const part = world.getDynamicProperty(this.getKey(key, DPDataBase.ListMark, i));
            if (part == undefined) {
                this.logger.error(`获取数组${key}的第${i}项出错`);
                return undefined;
            }
            data[i] = part as string;
        }
        return data;
    }
    private getListLen(key: string) {
        const lenKey = this.getKey(key, DPDataBase.ListLenMark);
        const length = world.getDynamicProperty(lenKey);
        if (typeof length === "number") {
            return length;
        }
    }
    private rmList(key: string) {
        const length = this.getListLen(key);
        if (length != undefined) {
            for (let i = 0; i < length; i++) {
                world.setDynamicProperty(this.getKey(key, DPDataBase.ListMark, i));
            }
        }
        world.setDynamicProperty(this.getKey(key, DPDataBase.ListLenMark));
    }

    //静态方法
    static clearAllDP() {
        world.clearDynamicProperties();
    }
    static getByteCount() {
        return world.getDynamicPropertyTotalByteCount();
    }
    static getAllKeys() {
        return world.getDynamicPropertyIds();
    }
}

export class ScoreBoardJSONDataBase extends DataBase<object> {
    private scoreboardName: string;
    private data: Record<string, any>;
    private readonly logger: Logger;

    constructor(name: string) {
        super(name, "jSB");
        this.scoreboardName = this.type + "_" + name;
        this.data = {};
        this.logger = new Logger(`${ScoreBoardJSONDataBase.name}_${name}`);
    }
    set(key: string, value: object) {
        this.getJSON();
        this.data[key] = value;
        system.run(async () => {
            await this.setJSON();
        });
    }
    get<T = unknown>(key: string, guard?: ValueGuard<T>): T | undefined {
        this.getJSON();
        const data = this.data?.[key];
        if (data == undefined) return undefined;

        if (guard) return guard(data) ? data : undefined;

        return this.data[key];
    }
    clear() {
        system.run(() => {
            this.resetScoreBoard();
        });
    }
    rm(key: string) {
        this.getJSON();
        delete this.data[key];
        this.setJSON();
    }
    keys() {
        this.getJSON();
        return Object.keys(this.data);
    }
    private resetScoreBoard() {
        if (world.scoreboard.getObjective(this.scoreboardName)) {
            world.scoreboard.removeObjective(this.scoreboardName);
        }
        return world.scoreboard.addObjective(this.scoreboardName);
    }
    private setJSON(sync: boolean = false) {
        const data = this.data;
        if (sync) {
            const sb = this.resetScoreBoard();
            const splitStrings = splitString(JSON.stringify(data), sync);
            for (let i = 0; i < splitStrings.length; i++) {
                sb.setScore(splitStrings[i], i);
            }
        } else {
            return new Promise(async (resolve) => {
                const sb = this.resetScoreBoard();
                const splitStrings = await splitString(JSON.stringify(data), sync);
                for (let i = 0; i < splitStrings.length; i++) {
                    sb.setScore(splitStrings[i], i);
                }
                resolve(1);
            });
        }
    }
    private getJSON(): unknown | undefined {
        const sb = world.scoreboard.getObjective(this.scoreboardName);
        if (!sb) return;
        let list = sb
            .getScores()
            .sort((a, b) => a.score - b.score)
            .map((t) => t.participant.displayName);
        try {
            this.data = JSON.parse(list.join("")) as Record<string, object>;
            return this.data;
        } catch (e) {
            this.logger.error(`转换计分板json数据失败`, e);
            return;
        }
    }
    edit<T extends Record<string, any> = any>(callback: (data: T) => boolean | void | undefined) {
        this.getJSON();
        const write = callback(this.data as any);
        if (write ?? true) this.setJSON(true);
    }
}
/**虚拟计分项，不一定存在计分板上 */
export class scoreboardObj {
    private sbObj: ScoreBoardDataBase;
    private participant: string | Entity | ScoreboardIdentity;
    constructor(sbObj: ScoreBoardDataBase, participant: string | Entity | ScoreboardIdentity) {
        this.sbObj = sbObj;
        this.participant = participant;
    }
    get() {
        return this.sbObj.get(this.participant);
    }
    set(value: number) {
        this.sbObj.set(this.participant, value);
    }
    add(value: number) {
        this.sbObj.add(this.participant, value);
    }
    rm() {
        this.sbObj.rm(this.participant);
    }
    isValid() {
        return this.get() != undefined;
    }
}

export class ScoreBoardDataBase extends DataBase<number> {
    private scoreboardName: string;
    private sb: ScoreboardObjective | undefined;
    private displayName?: string;
    constructor(name: string, displayName?: string, usePrefix: boolean = true) {
        super(name, "cSB");
        this.scoreboardName = usePrefix ? this.type + "_" + name : name;
        this.displayName = displayName;
        world.afterEvents.worldLoad.subscribe(() => {
            this.sb = this.getScoreBoard();
        });
    }
    getScoreBoard() {
        if (this.sb && this.sb.isValid) return this.sb;
        let sb = world.scoreboard.getObjective(this.scoreboardName);
        if (!sb) sb = world.scoreboard.addObjective(this.scoreboardName, this.displayName);
        this.sb = sb;
        return this.sb;
    }
    getScoreBoardName() {
        return this.scoreboardName;
    }
    set(key: string | Entity | ScoreboardIdentity, value: number | string) {
        if (typeof value != "number") value = parseInt(value);
        this.getScoreBoard().setScore(key, value);
    }
    get(key: string | Entity | ScoreboardIdentity) {
        if (this.getScoreBoard().hasParticipant(key)) {
            return this.getScoreBoard().getScore(key);
        }
    }
    add(key: string | Entity | ScoreboardIdentity, value: number | string) {
        if (typeof value != "number") value = parseInt(value);
        this.getScoreBoard().addScore(key, value);
    }

    /**获取一个虚拟计分项对象 */
    getObj(key: string | Entity | ScoreboardIdentity) {
        return new scoreboardObj(this, key);
    }

    /**删除指定计分项 */
    rm(key: string | Entity | ScoreboardIdentity) {
        this.getScoreBoard().removeParticipant(key);
    }

    /**获取所有计分项 */
    keys() {
        return this.getScoreBoard()
            .getParticipants()
            .map((t) => t.displayName);
    }

    participants(): ScoreboardIdentity[] {
        return this.getScoreBoard().getParticipants();
    }

    /**清空计分板(删除并重建) */
    clear() {
        this.dispose();
        this.getScoreBoard();
    }

    /**重置所有积分项(调用命令)*/
    resetAll() {
        if (!this.sb) return;
        cmd(`scoreboard players reset * "${this.sb.id}"`);
    }

    /**判断是否在正在指定Slot显示 */
    isDisplayAtSlot(DisplaySlotId: DisplaySlotId) {
        const curDisplay = world.scoreboard.getObjectiveAtDisplaySlot(DisplaySlotId);
        return curDisplay != undefined && curDisplay?.objective.id === this.sb?.id;
    }

    /**设置显示位置 */
    setDisplaySlot(SlotId: DisplaySlotId) {
        world.scoreboard.setObjectiveAtDisplaySlot(SlotId, { objective: this.getScoreBoard() });
    }

    /**删除这个scoreboard(下次用到会重建) */
    dispose() {
        if (this.sb && this.sb.isValid) {
            world.scoreboard.removeObjective(this.sb);
        }
    }
}

/**判断是否超过字节限制 */
function checkBytes(input: string) {
    return input.length > DataBase.maxChunkBytes / 3;
}

function splitString(input: String, sync?: false): Promise<string[]>;
function splitString(input: String, sync: true): string[];
function splitString(input: String, sync = false, batchSize = 10) {
    const MAX_LEN = 10922;
    const result: string[] = [];

    // 定义一个生成器函数来分割字符串
    function* split(resolve: (value?: unknown) => void) {
        let count = 0;

        for (let i = 0; i < input.length; i += MAX_LEN) {
            result.push(input.slice(i, i + MAX_LEN));

            count++;
            if (count >= batchSize) {
                count = 0;
                yield; // 每 batchSize 次才让出执行权
            }
        }

        resolve(result);
    }

    if (sync) {
        if (input.length < MAX_LEN) return [input];
        const sp = split(() => {});
        while (!sp.next().done) {}
        return result;
    } else {
        return new Promise((resolve) => {
            system.runJob(split(resolve));
        });
    }
}

export const exchangedb = new ScoreBoardJSONDataBase("exchange"); //脚本通信计分板
export const Configdb = new DPDataBase("Config");
