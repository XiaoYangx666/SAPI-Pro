import { Player, world } from "@minecraft/server";
import { intervalBus } from "../Event";
import { getAllPlayers } from "../func";
import { Logger } from "../utils/logger";
import { DPDataBase } from "./DataBase";

export interface NameDBOptions {
    /**自动更新玩家名，默认true */
    autoUpdate?: boolean;
    /**更新间隔时间，单位s，默认60s */
    updateInterval?: number;
    /**只更新已存在nameDb的玩家,默认true */
    updateExists?: boolean;
}

/**一个用于存储玩家名字的存储库 */
export class NameDB {
    private readonly db = new DPDataBase("playerName");
    private readonly reverseDb = new DPDataBase("playerName_reverse");
    private readonly cache = new Map<string, string>();
    private readonly logger = new Logger(NameDB.name);
    private lastUpdate: number = 0;
    private options: Required<NameDBOptions>;

    constructor(options?: NameDBOptions) {
        this.options = { autoUpdate: true, updateInterval: 60, updateExists: true };
        if (options) {
            this.options = Object.assign(this.options, options);
        }
        this.sub();
    }

    private sub() {
        world.afterEvents.worldLoad.subscribe(() => {
            this.repairReverseIndex();
        });
        if (!this.options.autoUpdate) return;
        intervalBus.subscribesec((sec) => {
            if (sec - this.lastUpdate >= this.options.updateInterval) {
                this.lastUpdate = sec;
                this.updateAll();
            }
        });
    }

    repairReverseIndex() {
        this.reverseDb.clear();
        this.db.entries().forEach(([id, name]) => {
            if (typeof name === "string") {
                this.reverseDb.set(name, id);
            }
        });
    }

    /**设置玩家的名字*/
    set(player: Player): void {
        const oldName = this.db.get(player.id);
        if (typeof oldName === "string") {
            if (oldName === player.name) return;
            // 清理旧的反向索引
            this.reverseDb.rm(oldName);
        }
        this.db.set(player.id, player.name);
        this.cache.set(player.id, player.name);
        this.reverseDb.set(player.name, player.id);
    }

    removeById(playerId: string) {
        const name = this.db.get(playerId);
        if (typeof name === "string") {
            this.reverseDb.rm(name);
        }
        this.cache.delete(playerId);
        this.db.rm(playerId);
    }

    /**根据玩家id获取名字
     * @param playerId 玩家id
     */
    getNameById(playerId: string): string | undefined {
        const ans = this.cache.get(playerId) ?? this.db.get(playerId);
        if (ans != undefined && typeof ans != "string") {
            this.logger.error(`${playerId} 值的格式错误`);
            return undefined;
        }
        //设置缓存
        if (ans != undefined) {
            this.cache.set(playerId, ans);
        }
        return ans;
    }

    getIdByNameUnsafe(playerName: string): string | undefined {
        const ans = this.reverseDb.get(playerName);
        if (ans != undefined && typeof ans != "string") {
            this.logger.error(`${playerName} 值的格式错误`);
            return undefined;
        }
        return ans;
    }

    /**更新所有在线玩家的名字*/
    updateAll() {
        getAllPlayers().forEach((p) => this.update(p));
    }

    private update(player: Player) {
        if (this.options.updateExists) {
            const isExist = this.getNameById(player.id);
            if (!isExist) return;
        }
        this.set(player);
    }
}
