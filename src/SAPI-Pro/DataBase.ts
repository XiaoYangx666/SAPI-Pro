import { Player, ScoreboardObjective, system, Vector3, world } from "@minecraft/server";
import { libName } from "./Config";
import { cmd, LibError } from "./func";
import { DisplaySlotId } from "@minecraft/server";

type DPTypes = string | number | boolean | Vector3;
export abstract class DataBase<T> {
  static maxChunkBytes = 32767;
  static DBMap: Record<string, DataBase<any>> = {}; //存储所有注册过的数据库
  public name: string; //数据库名
  public type: "DP" | "jSB" | "cSB" | undefined; //数据库类型(SB不是骂人)
  constructor(name: string) {
    this.name = name;
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
export class DPDataBase extends DataBase<DPTypes> {
  private static ListLenMark = "arrlen";
  private static ListMark = "arr";
  private keyPrefix: string; //前缀
  constructor(name: string) {
    super(name);
    this.type = "DP";
    this.keyPrefix = this.name;
  }
  private getKey(key: string, mark: string = "") {
    return `${this.keyPrefix}.${key}_${mark}`;
  }
  set(key: string, value: DPTypes) {
    if (typeof value == "string" && checkBytes(value)) {
      this.setLargeString(key, value);
    } else {
      world.setDynamicProperty(this.getKey(key), value);
    }
  }
  get(key: string) {
    if (this.getListLen(key) != undefined) {
      return this.getLargeString(key);
    } else {
      return world.getDynamicProperty(this.getKey(key));
    }
  }
  rm(key: string) {
    if (this.getListLen(key) != undefined) {
      this.rmList(key);
    } else {
      world.setDynamicProperty(this.getKey(key));
    }
  }
  getrealKeys() {
    return world.getDynamicPropertyIds().filter((t) => t.startsWith(this.keyPrefix));
  }
  keys() {
    const re = new RegExp(`((?<=^${this.keyPrefix}\.)(.*)(?=_($|(${DPDataBase.ListLenMark}))))`);
    const keys = this.getrealKeys()
      .filter((t) => re.test(t))
      .map((t) => (t.match(re) || [""])[0]);
    return keys;
  }
  /**以json形式存储一个对象 */
  setJSON(key: string, value: object) {
    const data = JSON.stringify(value);
    this.set(key, data);
  }
  /**获取json形式存储的对象 */
  getJSON(key: string): object | undefined {
    const data = this.get(key);
    if (data == undefined) return;
    if (typeof data != "string") return;
    try {
      return JSON.parse(data);
    } catch (e) {
      return undefined;
    }
  }
  clear() {
    const keys = this.getrealKeys();
    for (let key of keys) {
      world.setDynamicProperty(key);
    }
  }
  private setLargeString(key: string, value: string) {
    system.run(async () => {
      const splitStrings = await splitString(value);
      this.setList(key, splitStrings);
    });
  }
  private getLargeString(key: string) {
    return this.getList(key)?.join("");
  }
  private setList(key: string, list: string[]) {
    const origin = world.getDynamicProperty(this.getKey(key, DPDataBase.ListLenMark));
    world.setDynamicProperty(this.getKey(key, DPDataBase.ListLenMark), list.length);
    for (let i = 0; i < list.length; i++) {
      world.setDynamicProperty(this.getKey(key, DPDataBase.ListMark + i), list[i]);
    }
    //如果为修改，要删除多余的
    if (origin != undefined && typeof origin == "number" && origin > list.length) {
      for (let i = list.length; i < origin; i++) {
        world.setDynamicProperty(this.getKey(key, DPDataBase.ListMark + i));
      }
    }
  }
  private getList(key: string) {
    const length = this.getListLen(key);
    if (!length) return;
    const data: string[] = new Array(length);
    for (let i = 0; i < length; i++) {
      const part = world.getDynamicProperty(this.getKey(key, DPDataBase.ListMark + i));
      if (part == undefined) {
        LibError(`Error in getting list part ${i} of ${key}`);
        return undefined;
      }
      data[i] = part as string;
    }
    return data;
  }
  private getListLen(key: string) {
    const length = world.getDynamicProperty(this.getKey(key, DPDataBase.ListLenMark));
    if (length != undefined && typeof length == "number") {
      return length;
    }
  }
  private rmList(key: string) {
    const length = this.getListLen(key);
    if (length != undefined) {
      for (let i = 0; i < length; i++) {
        world.setDynamicProperty(this.getKey(key, DPDataBase.ListMark + i));
      }
    }
    world.setDynamicProperty(this.getKey(key, DPDataBase.ListLenMark));
  }
  static isDPDataBase(db: DataBase<any>): db is DPDataBase {
    return db.type == "DP";
  }
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
  constructor(name: string) {
    super(name);
    this.type = "jSB";
    this.scoreboardName = this.type + "_" + name;
    this.data = {};
  }
  set(key: string, value: object) {
    this.getJSON();
    this.data[key] = value;
    system.run(async () => {
      await this.setJSON();
    });
  }
  get(key: string) {
    this.getJSON();
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
        sb.setScore(i + splitStrings[i], i);
      }
    } else {
      return new Promise(async (resolve) => {
        const sb = this.resetScoreBoard();
        const splitStrings = await splitString(JSON.stringify(data), sync);
        for (let i = 0; i < splitStrings.length; i++) {
          sb.setScore(i + splitStrings[i], i);
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
      .map((t) => t.participant.displayName.slice(1));
    try {
      this.data = JSON.parse(list.join("")) as Record<string, object>;
      return this.data;
    } catch (e) {
      return;
    }
  }
  edit(callback: (data: Record<string, any>) => boolean | void | undefined) {
    this.getJSON();
    const write = callback(this.data);
    if (write ?? true) this.setJSON(true);
  }
  /*
    getLock() {
        return sysdb.getObj(this.name + "_lock");
    }
    async withLock(callback: (data: Record<string, any>) => Promise<boolean | void> | boolean | undefined | void, maxTrys: number = 10) {
        const lock = this.getLock();
        for (let trys = 0; trys < maxTrys; trys++) {
            if (!lock.get()) {
                lock.set(1); // 获取锁
                try {
                    this.getJSON();
                    const write = await callback(this.data); // 执行回调函数
                    if (write ?? true) await this.setJSON(true);
                    return true; // 操作成功
                } catch (e) {
                    console.error("Error during locked operation:", e);
                    return false; // 操作失败
                } finally {
                    lock.set(0); // 释放锁
                }
            }
            await new Promise((resolve) => system.runTimeout(() => resolve(1), trys > 5 ? 1 : 0)); // 等待一段时间后重试
        }
        return false; // 锁获取失败
    }
    */
}
/**虚拟计分项，不一定存在计分板上 */
class scoreboardObj {
  private sbObj: ScoreBoardDataBase;
  private name: string | Player;
  constructor(sbObj: ScoreBoardDataBase, name: string | Player) {
    this.sbObj = sbObj;
    this.name = name;
  }
  get() {
    return this.sbObj.get(this.name);
  }
  set(value: number) {
    this.sbObj.set(this.name, value);
  }
  rm() {
    this.sbObj.rm(this.name);
  }
  isValid() {
    return this.get() != undefined;
  }
}
export class ScoreBoardDataBase extends DataBase<number> {
  private scoreboardName: string;
  private sb: ScoreboardObjective | undefined;
  constructor(name: string) {
    super(name);
    this.type = "cSB";
    this.scoreboardName = this.type + "_" + name;
    world.afterEvents.worldLoad.subscribe(() => {
      this.sb = this.getScoreBoard();
    });
  }
  getScoreBoard() {
    if (this.sb && this.sb.isValid) return this.sb;
    let sb = world.scoreboard.getObjective(this.scoreboardName);
    if (!sb) sb = world.scoreboard.addObjective(this.scoreboardName);
    this.sb = sb;
    return this.sb;
  }
  set(key: string | Player, value: number | string) {
    if (typeof value != "number") value = parseInt(value);
    this.getScoreBoard().setScore(key, value);
  }
  get(key: string | Player) {
    if (this.getScoreBoard().hasParticipant(key)) {
      return this.getScoreBoard().getScore(key);
    }
  }
  /**获取一个虚拟计分项对象 */
  getObj(key: string | Player) {
    return new scoreboardObj(this, key);
  }
  rm(key: string | Player) {
    this.getScoreBoard().removeParticipant(key);
  }
  keys() {
    return this.getScoreBoard()
      .getParticipants()
      .map((t) => t.displayName);
  }
  clear() {
    if (this.sb && this.sb.isValid) {
      world.scoreboard.removeObjective(this.sb);
    }
    this.getScoreBoard();
  }
  /**重置所有积分项即reset * */
  resetAll() {
    cmd("scoreboard players reset * " + this.scoreboardName);
  }
  setDisplaySlot(SlotId: DisplaySlotId) {
    world.scoreboard.setObjectiveAtDisplaySlot(SlotId, { objective: this.getScoreBoard() });
  }
}
/**判断是否超过字节限制 */
function checkBytes(input: string) {
  let totalBytes = 0;
  for (let i = 0; i < input.length; i++) {
    totalBytes += (input[i].charCodeAt(0) ?? 0) > 0x7f ? 3 : 1;
    if (totalBytes > DataBase.maxChunkBytes) return true;
  }
  return false;
}

export function splitString(input: String, sync?: false): Promise<string[]>;
export function splitString(input: String, sync: true): string[];
export function splitString(input: String, sync = false) {
  const maxBytes = 32767; // 每个块的最大字节数
  const result: string[] = [];
  let startIndex = 0;
  let currentBytes = 0;
  // 定义一个生成器函数来分割字符串
  function* split(resolve: (value?: unknown) => void) {
    for (let i = 0; i < input.length; i++) {
      const charBytes = (input.codePointAt(i) ?? 0) > 0x7f ? 3 : 1; // 获取当前字符的字节数
      // 如果加上当前字符后超过最大字节数，则将当前字符串加入结果数组，并重置
      if (currentBytes + charBytes > maxBytes) {
        result.push(input.slice(startIndex, i));
        startIndex = i;
        currentBytes = 0;
        yield;
      }
      // 更新当前字节数
      currentBytes += charBytes;
    }
    if (startIndex < input.length) {
      result.push(input.slice(startIndex));
    }
    resolve(resolve(result));
  }
  if (sync) {
    if (input.length < 10922) return [input];
    const sp = split(() => {});
    while (true) {
      if (sp.next().done) break;
    }
    return result;
  } else {
    return new Promise((resolve) => {
      system.runJob(split(resolve));
    });
  }
}

export const sysdb = new ScoreBoardDataBase(libName); //系统计分板
export const exchangedb = new ScoreBoardJSONDataBase("exchange"); //脚本通信计分板
export const Configdb = new DPDataBase("Config");
