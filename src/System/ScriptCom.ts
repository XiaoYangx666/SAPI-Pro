import { system } from "@minecraft/server";
import { pcommand } from "../Command/main";
import { LibConfig, PackInfo } from "../Config";
import { exchangedb } from "../DataBase/DataBase";
import { LibErrorMes, LibMessage } from "../func";
import { regSysInfo } from "./sysinfo";

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
    if (!LibConfig.isBeta) {
        return;
    }
    //选举主机
    await system.waitTicks(5);
    await electHost();
    if (!LibConfig.isHost) {
        //非主机向主机注册命令
        pcommand.regToHost();
    } else {
        await system.waitTicks(5);
        //主机接受命令注册并注册信息命令
        pcommand.regClientCommand();
        regSysInfo();
    }
}

async function electHost() {
    const packs = exchangedb.get<exchangedbData["packs"]>("packs");
    if (!packs) return;
    //寻找最大版本
    const max = Object.values(packs).reduce(
        (acc, t) => (t.isBeta ? Math.max(acc, t.version) : acc),
        LibConfig.version
    );
    //若自身是最大，则尝试设置
    if (LibConfig.version >= max) {
        exchangedb.edit<exchangedbData>((data) => {
            if (data.Host != undefined) return false; //已有主模块则不修改
            //否则设置自己为主模块
            data.Host = LibConfig.packInfo.uuid!;
            LibConfig.isHost = true;
            LibMessage(`主模块:${LibConfig.packInfo.name},已发现模块:${Object.keys(packs).length}`);
        });
    }
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
