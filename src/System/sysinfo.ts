import { Command, pcommand } from "../Command/main";
import { LibConfig } from "../Config";
import { exchangedb } from "../DataBase/DataBase";
import { formManager } from "../Form/formManager";
import { BodyInfoForm, ButtonForm } from "../Form/main";
import { translator } from "../Translate";
import { LangSysInfo } from "./lang";
import { exchangedbData, packComInfo } from "./ScriptCom";

export function regSysInfo() {
    pcommand.registerCommand(sysInfoCmd);
    pcommand.registerCommand(
        new Command("syspacks", "查看SAPI-Pro包信息", false, (p, parms) => {
            formManager.open(p, sysinfoForm, {}, 10);
        })
    );
}

const sysInfoCmd = new Command("sysinfo", "显示SAPI-Pro系统信息", false, (player, params) => {
    const t = translator.createPureFor(player);

    player.sendMessage("\n" + t(LangSysInfo.header, { version: LibConfig.version }));
    player.sendMessage(t(LangSysInfo.mainModule, { name: LibConfig.packInfo.name }));
    player.sendMessage(t(LangSysInfo.registeredCommands, { count: pcommand.commands.size }));
    const packs = exchangedb.get<exchangedbData["packs"]>("packs") ?? {};
    player.sendMessage(
        t(LangSysInfo.loadedModules, {
            count: Object.keys(packs).length,
        })
    );
    player.sendMessage("§7------------------------------------------");
});

const packInfoPage = new BodyInfoForm<{ uuid: string; pack: packComInfo }>(
    LangSysInfo.packInfoTitle,
    (form, player, args) => {
        const t = translator.createPureFor(player);

        const { uuid, pack } = args;
        const info = pack.info;

        form.body(
            [
                t(LangSysInfo.uuid, { uuid }),
                t(LangSysInfo.packName, { name: info.name }),
                t(LangSysInfo.namespace, { namespace: info.nameSpace }),
                t(LangSysInfo.author, { author: info.author }),
                t(LangSysInfo.versionField, { version: info.version }),
                t(LangSysInfo.libVersion, {
                    version: pack.version,
                    type: pack.isBeta || pack.isBeta == undefined ? "beta" : "stable",
                }),
                "",
                info.description,
            ].join("\n")
        );
    }
);

const sysinfoForm = new ButtonForm({
    title: LangSysInfo.title,
    generator(form, p, args, t) {
        const packs = exchangedb.get<exchangedbData["packs"]>("packs") ?? {};
        form.body(
            [
                t(LangSysInfo.header, {
                    version: `${LibConfig.version}-${LibConfig.isBeta ? "beta" : "stable"}`,
                }),
                t(LangSysInfo.mainModule, { name: LibConfig.packInfo.name }),
                t(LangSysInfo.registeredCommands, { count: pcommand.commands.size }),
                t(LangSysInfo.loadedModules, {
                    count: Object.keys(packs).length,
                }),
                t(LangSysInfo.clickViewPack),
            ].join("\n")
        );
    },
    buttonGenerator() {
        const packs = exchangedb.get<exchangedbData["packs"]>("packs") ?? {};
        return Object.entries(packs).map(([uuid, pack]) => ({
            label: pack.info.name,
            func(ctx) {
                ctx.push(packInfoPage, { uuid, pack });
            },
        }));
    },
});
