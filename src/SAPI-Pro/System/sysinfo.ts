import { LibConfig } from "SAPI-Pro/Config";
import { Command, pcommand } from "../Command/main";
import { exchangedb } from "SAPI-Pro/DataBase";
import { CommonForm } from "../Form/commonForm";
import { packComInfo } from "./ScriptCom";
import { formManager } from "SAPI-Pro/main";

export function regSysInfo() {
    pcommand.registerCommand(sysInfoCmd);
    pcommand.registerCommand(
        new Command("syspacks", "查看SAPI-Pro包信息", false, (p, parms) => {
            formManager.open(p, sysinfoForm, {}, 10);
        })
    );
}

const sysInfoCmd = new Command("sysinfo", "显示SAPI-Pro系统信息", false, (player, params) => {
    player.sendMessage(`\n§6=== §bSAPI-Pro §6| §a版本: ${LibConfig.version} §6===`);
    player.sendMessage(`§e* §f主模块: §a${LibConfig.packInfo.name}`);
    player.sendMessage(`§e* §f已注册命令: §c${pcommand.commands.size} 条`);
    player.sendMessage(`§e* §f已加载模块: §d${Object.keys(exchangedb.get("scriptsInfo")).length} 个`);
    player.sendMessage(`§7------------------------------------------`);
});

const packInfoPage = CommonForm.BodyInfoForm("SAPI-Pro包信息", (form, player, args) => {
    const [uuid, pack] = args["pack"] as [string, packComInfo];
    const info = pack.info;
    form.body(
        [
            `§s§lUUID§r§7: §f${uuid}`,
            `§s§l包名§r§7: §f${info.name}`,
            `§s§l命名空间§r§7: §f${info.nameSpace}`,
            `§s§l作者§r§7: §f${info.author}`,
            `§s§l版本§r§7: §f${info.version}`,
            "",
            info.description,
        ].join("\n")
    );
});

const sysinfoForm = CommonForm.ButtonListForm({
    title: "SAPI-Pro系统信息",
    generator(form, p, args) {
        form.body(
            [
                `§6=== §bSAPI-Pro §6| §a版本: ${LibConfig.version} §6===`,
                `§e* §f主模块: §a${LibConfig.packInfo.name}`,
                `§e* §f已注册命令: §c${pcommand.commands.size} 条`,
                `§e* §f已加载模块: §d${Object.keys(exchangedb.get("scriptsInfo")).length} 个`,
                `点击查看包信息`,
            ].join("\n")
        );
        const packs = exchangedb.get("scriptsInfo") as Record<string, packComInfo>;
        for (let pack of Object.values(packs)) form.button(pack.info.name);
    },
    handler(index, ctx) {
        const packs = exchangedb.get("scriptsInfo") as Record<string, packComInfo>;
        const entries = Object.entries(packs);
        ctx.push(packInfoPage, { pack: entries[index] });
    },
});
