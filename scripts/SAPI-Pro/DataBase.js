import { system, world } from "@minecraft/server";
import { libName } from "./Config";
export class DataBase {
    constructor(name) {
        this.name = name;
        DataBase.DBMap[name] = this;
    }
    static getDB(name) {
        return this.DBMap[name];
    }
    static getDBs() {
        return Object.values(this.DBMap);
    }
}
DataBase.maxChunkBytes = 32767;
DataBase.DBMap = {}; //存储所有注册过的数据库
export class DPDataBase extends DataBase {
    constructor(name) {
        super(name);
        this.type = "DP";
        this.keyPrefix = this.name;
    }
    getKey(key, mark = "") {
        return `${this.keyPrefix}.${key}_${mark}`;
    }
    set(key, value) {
        if (typeof value == "string" && checkBytes(value)) {
            this.setLargeString(key, value);
        }
        else {
            world.setDynamicProperty(this.getKey(key), value);
        }
    }
    get(key) {
        if (this.getListLen(key) != undefined) {
            return this.getLargeString(key);
        }
        else {
            return world.getDynamicProperty(this.getKey(key));
        }
    }
    rm(key) {
        if (this.getListLen(key) != undefined) {
            this.rmList(key);
        }
        else {
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
    setJSON(key, value) {
        const data = JSON.stringify(value);
        this.set(key, data);
    }
    /**获取json形式存储的对象 */
    getJSON(key) {
        const data = this.get(key);
        if (data == undefined)
            return;
        if (typeof data != "string")
            return;
        try {
            return JSON.parse(data);
        }
        catch (e) {
            return undefined;
        }
    }
    clear() {
        const keys = this.getrealKeys();
        for (let key of keys) {
            world.setDynamicProperty(key);
        }
    }
    setLargeString(key, value) {
        system.run(async () => {
            const splitStrings = await splitString(value);
            this.setList(key, splitStrings);
        });
    }
    getLargeString(key) {
        return this.getList(key)?.join("");
    }
    setList(key, list) {
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
    getList(key) {
        const length = this.getListLen(key);
        if (!length)
            return;
        const data = new Array(length);
        for (let i = 0; i < length; i++) {
            const part = world.getDynamicProperty(this.getKey(key, DPDataBase.ListMark + i));
            if (part == undefined) {
                console.error("GetList Failed");
                return undefined;
            }
            data[i] = part;
        }
        return data;
    }
    getListLen(key) {
        const length = world.getDynamicProperty(this.getKey(key, DPDataBase.ListLenMark));
        if (length != undefined && typeof length == "number") {
            return length;
        }
    }
    rmList(key) {
        const length = this.getListLen(key);
        if (length != undefined) {
            for (let i = 0; i < length; i++) {
                world.setDynamicProperty(this.getKey(key, DPDataBase.ListMark + i));
            }
        }
        world.setDynamicProperty(this.getKey(key, DPDataBase.ListLenMark));
    }
    static isDPDataBase(db) {
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
DPDataBase.ListLenMark = "arrlen";
DPDataBase.ListMark = "arr";
export class ScoreBoardJSONDataBase extends DataBase {
    constructor(name) {
        super(name);
        this.type = "jSB";
        this.scoreboardName = this.type + "_" + name;
        this.data = {};
    }
    set(key, value) {
        this.getJSON();
        this.data[key] = value;
        system.run(async () => {
            await this.setJSON();
        });
    }
    get(key) {
        this.getJSON();
        return this.data[key];
    }
    clear() {
        system.run(() => {
            this.resetScoreBoard();
        });
    }
    rm(key) {
        this.getJSON();
        delete this.data[key];
        this.setJSON();
    }
    keys() {
        this.getJSON();
        return Object.keys(this.data);
    }
    resetScoreBoard() {
        if (world.scoreboard.getObjective(this.scoreboardName)) {
            world.scoreboard.removeObjective(this.scoreboardName);
        }
        return world.scoreboard.addObjective(this.scoreboardName);
    }
    setJSON(sync = false) {
        const data = this.data;
        if (sync) {
            const sb = this.resetScoreBoard();
            const splitStrings = splitString(JSON.stringify(data), sync);
            for (let i = 0; i < splitStrings.length; i++) {
                sb.setScore(i + splitStrings[i], i);
            }
        }
        else {
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
    getJSON() {
        const sb = world.scoreboard.getObjective(this.scoreboardName);
        if (!sb)
            return;
        let list = sb
            .getScores()
            .sort((a, b) => a.score - b.score)
            .map((t) => t.participant.displayName.slice(1));
        try {
            this.data = JSON.parse(list.join(""));
            return this.data;
        }
        catch (e) {
            return;
        }
    }
    edit(callback) {
        this.getJSON();
        const write = callback(this.data);
        if (write ?? true)
            this.setJSON(true);
    }
}
/**虚拟计分项，不一定存在计分板上 */
class scoreboardObj {
    constructor(sbObj, name) {
        this.sbObj = sbObj;
        this.name = name;
    }
    get() {
        return this.sbObj.get(this.name);
    }
    set(value) {
        this.sbObj.set(this.name, value);
    }
    rm() {
        this.sbObj.rm(this.name);
    }
    isValid() {
        return this.get() != undefined;
    }
}
export class ScoreBoardDataBase extends DataBase {
    constructor(name) {
        super(name);
        this.type = "cSB";
        this.scoreboardName = this.type + "_" + name;
        this.sb = this.getScoreBoard();
    }
    getScoreBoard() {
        if (this.sb && this.sb.isValid())
            return this.sb;
        let sb = world.scoreboard.getObjective(this.scoreboardName);
        if (!sb)
            sb = world.scoreboard.addObjective(this.scoreboardName);
        this.sb = sb;
        return this.sb;
    }
    set(key, value) {
        if (typeof value != "number")
            value = parseInt(value);
        this.getScoreBoard().setScore(key, value);
    }
    get(key) {
        if (this.getScoreBoard().hasParticipant(key)) {
            return this.getScoreBoard().getScore(key);
        }
    }
    /**获取一个虚拟计分项对象 */
    getObj(key) {
        return new scoreboardObj(this, key);
    }
    rm(key) {
        this.getScoreBoard().removeParticipant(key);
    }
    keys() {
        return this.getScoreBoard()
            .getParticipants()
            .map((t) => t.displayName);
    }
    clear() {
        if (this.sb && this.sb.isValid()) {
            world.scoreboard.removeObjective(this.sb);
        }
        this.getScoreBoard();
    }
}
/**判断是否超过字节限制 */
function checkBytes(input) {
    let totalBytes = 0;
    for (let i = 0; i < input.length; i++) {
        totalBytes += (input[i].charCodeAt(0) ?? 0) > 0x7f ? 3 : 1;
        if (totalBytes > DataBase.maxChunkBytes)
            return true;
    }
    return false;
}
export function splitString(input, sync = false) {
    const maxBytes = 32767; // 每个块的最大字节数
    const result = [];
    let startIndex = 0;
    let currentBytes = 0;
    // 定义一个生成器函数来分割字符串
    function* split(resolve) {
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
        if (input.length < 10922)
            return [input];
        const sp = split(() => { });
        while (true) {
            if (sp.next().done)
                break;
        }
        return result;
    }
    else {
        return new Promise((resolve) => {
            system.runJob(split(resolve));
        });
    }
}
export const sysdb = new ScoreBoardDataBase(libName); //系统计分板
export const exchangedb = new ScoreBoardJSONDataBase("exchange"); //脚本通信计分板
export const Configdb = new DPDataBase("Config");
