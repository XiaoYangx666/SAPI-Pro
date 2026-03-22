import { system } from "@minecraft/server";
import { LibConfig, PackInfo } from "../Config";
import { exchangedb } from "../DataBase/DataBase";
import { LibErrorMes, LibMessage } from "../func";

export async function initCom() {
    const uuid = LibConfig.packInfo.uuid;
    if (!uuid) {
        LibErrorMes("包加载失败,无uuid");
        return;
    }
    //重置脚本信息和命令注册
    exchangedb.edit<exchangedbData>((data) => {
        const packs = data.packs as object;
        if (packs == undefined || Object.keys(packs).length != 0) {
            data.packs = {};
            data.cmd = {};
            data.Host = undefined;
            return true;
        }
        return false;
    });
    await system.waitTicks(5);
    //设定自己信息
    LibConfig.isHost = false;

    exchangedb.edit<exchangedbData>((data) => {
        const packs = data.packs!;
        const info = {
            isBeta: LibConfig.isBeta,
            version: LibConfig.version,
            info: LibConfig.packInfo,
        };
        packs[uuid] = info;
    });

    const pack = LibConfig.packInfo;
    LibMessage(
        `已加载模块${pack.name},lib版本:${LibConfig.version}-${LibConfig.isBeta ? "beta" : "stable"}`
    );
    //欢迎信息
    if (LibConfig.packInfo.greeting) {
        LibMessage(`${pack.greeting}`);
    }

    //不是beta版不参与选举
}

export interface packComInfo {
    version: number;
    isBeta: boolean;
    info: PackInfo;
}

export interface exchangedbData {
    packs?: Record<string, packComInfo>;
    cmd?: any;
    Host?: any;
}
