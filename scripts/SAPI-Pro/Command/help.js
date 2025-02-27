import { isAdmin } from "SAPI-Pro/func";
import { PreOrdertraverse } from "./func";
import { Command, commandParser } from "./main";
export class CommandHelp {
    constructor(pcommand) {
        this.pcommand = pcommand;
        this.helpCommand = new Command("help", "提供.命令帮助/命令列表", false, this.commandHelp.bind(this));
        this.helpCommand.addParamBranches([
            {
                name: "page",
                type: "int",
                optional: true,
                default: 1,
            },
            {
                name: "commandName",
                type: "string",
                optional: true,
            },
        ]);
        this.pcommand.registerCommand(this.helpCommand);
    }
    commandHelp(player, args) {
        if (args.commandName) {
            const commandObj = this.pcommand.getCommandInfo(args.commandName);
            if (commandObj == undefined)
                return commandParser.ErrorMessage(player, this.helpCommand, args.commandName, [args.commandName], 0, "命令不存在");
            this.handleCommandHelp(player, commandObj);
        }
        if (args.page != undefined)
            this.handlePageHelp(player, args.page - 1);
    }
    handlePageHelp(player, page) {
        const pagelimit = 7;
        let commands = this.pcommand.getCommandsList(isAdmin(player));
        const maxpage = Math.ceil(commands.length / pagelimit);
        if (page < 0)
            page = 0;
        if (page >= maxpage)
            page = maxpage - 1;
        let text = `§2---显示帮助手册总${maxpage}页中的第${page + 1}页(.help <页码>)---\n`;
        for (let i = page * pagelimit; i < (page + 1) * pagelimit && i < commands.length; i++) {
            const command = this.pcommand.getCommandInfo(commands[i]);
            const color = command.isAdmin ? "§6" : "";
            text += `§f${color}.${commands[i]}§r:${limittext(command.explain, 20)}\n`;
        }
        text += `§2小提示:输入.help <命令>可以查看命令详细帮助`;
        player.sendMessage(text);
    }
    handleCommandHelp(player, command) {
        const isop = isAdmin(player);
        const usageList = getCommandUsage(command, isop);
        player.sendMessage(`§e.${command.name}:\n${command.explain}\n§f使用:\n`);
        for (const usage of usageList) {
            player.sendMessage("- ." + usage);
        }
    }
}
const EnterParam = (T, ctx, stack) => {
    if (!T.subParams) {
        const priorStr = stack.map((t) => paramFormat(t[0])).join(" ");
        ctx.usageList.push(priorStr + (priorStr ? " " : "") + paramFormat(T) + "§r" + (T.explain ? T.explain : ctx.cmdexplain));
    }
};
const enterCommand = (T, ctx, stack) => {
    const priorStr = stack.map((t) => t[0].name).join(" ");
    if (((T.isAdmin && ctx.isop) || !T.isAdmin) && !T.isHidden) {
        //(所有参数为可选∩没有子命令)∪(所有参数为可选∩有处理函数)
        //即为:所有参数为可选∩(没有子命令∪有处理函数)
        if ((T.handler || T.subCommands.length == 0) && T.paramBranches.every((t) => (t instanceof Array ? t.every((tt) => tt.optional) : t.optional))) {
            ctx.usageList.push(`${T.isAdmin || ctx.command.isAdmin ? "§6" : ""}${priorStr}${priorStr.length ? " " : ""}${T.name} §r${T.explain}`);
        }
        // 若有参数
        if (T.paramBranches.length > 0) {
            for (let branch of T.paramBranches) {
                const ctx1 = { usageList: [], cmdexplain: T.explain };
                PreOrdertraverse(branch, { getSubNodes: (T) => T.subParams, enter: EnterParam, ctx: ctx1 });
                ctx.usageList.push(...ctx1.usageList.map((t) => `${T.isAdmin || ctx.command.isAdmin ? "§6" : ""}${priorStr}${priorStr.length ? " " : ""}${T.name} ${t}`));
            }
        }
    }
};
function getCommandUsage(command, isop) {
    const ctx = { isop: isop, usageList: [], command: command };
    PreOrdertraverse(command, { getSubNodes: (T) => T.subCommands, enter: enterCommand, ctx: ctx });
    return ctx.usageList;
}
function paramFormat(param) {
    if (param.type == "flag")
        return param.name;
    const parentheses = param.optional ? "[]" : "<>";
    let paramType = param.type;
    //显示枚举类型
    if (param.type == "enum" && param.enums) {
        paramType = param.enums.join("|");
    }
    return parentheses[0] + param.name + ":" + paramType + parentheses[1];
}
function limittext(text, limit) {
    return text.length > limit ? text.slice(0, limit) + "..." : text;
}
