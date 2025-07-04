import { Player } from "@minecraft/server";
import { isAdmin } from "../func";
import { Command } from "./commandClass";
import { enterNodeFunc, PreOrdertraverse } from "./parser/func";
import { ParamDefinition } from "./interface";
import { CommandParser } from "./parser/parser";
import { CommandManager } from "./manager";

interface helpCommandParam {
    page?: number;
    commandName?: string;
}
export class CommandHelp {
    private readonly helpCommand: Command;
    constructor(private readonly pcommand: CommandManager, private readonly parser: CommandParser) {
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
    commandHelp(player: Player, args: helpCommandParam) {
        if (args.commandName) {
            const commandObj = this.pcommand.getCommandInfo(args.commandName);
            if (commandObj == undefined)
                return this.parser.ErrorMessage(
                    player,
                    this.helpCommand,
                    args.commandName,
                    [args.commandName],
                    0,
                    true,
                    "命令不存在"
                );
            this.handleCommandHelp(player, commandObj);
        }
        if (args.page != undefined) this.handlePageHelp(player, args.page - 1);
    }
    handlePageHelp(player: Player, page: number) {
        const pagelimit = 7;
        let commands = this.pcommand.getCommandsList(isAdmin(player));
        const maxpage = Math.ceil(commands.length / pagelimit);
        if (page < 0) page = 0;
        if (page >= maxpage) page = maxpage - 1;

        let text = `§2---显示帮助手册总${maxpage}页中的第${page + 1}页(.help <页码>)---\n`;
        for (let i = page * pagelimit; i < (page + 1) * pagelimit && i < commands.length; i++) {
            const command = this.pcommand.getCommandInfo(commands[i]) as Command;
            const color = command.isAdmin ? "§6" : "";
            text += `§f${color}.${commands[i]}§r:${limittext(command.explain, 20)}\n`;
        }
        text += `§2小提示:输入.help <命令>可以查看命令详细帮助`;
        player.sendMessage(text);
    }
    handleCommandHelp(player: Player, command: Command) {
        const isop = isAdmin(player);
        const usageList = getCommandUsage(command, isop);
        player.sendMessage(`§e.${command.name}:\n${command.explain}\n§f使用:\n`);
        for (const usage of usageList) {
            player.sendMessage("- ." + usage);
        }
    }
}

const EnterParam: enterNodeFunc<ParamDefinition> = (T, ctx, stack) => {
    if (!T.subParams) {
        const priorStr = stack.map((t) => paramFormat(t[0])).join(" ");
        ctx.usageList.push(
            priorStr + (priorStr ? " " : "") + paramFormat(T) + "§r" + (T.explain ? T.explain : ctx.cmdexplain)
        );
    }
};

const enterCommand: enterNodeFunc<Command> = (T, ctx, stack) => {
    const priorStr = stack.map((t) => t[0].name).join(" ");
    if (((T.isAdmin && ctx.isop) || !T.isAdmin) && !T.isHidden) {
        //(所有参数为可选∩没有子命令)∪(所有参数为可选∩有处理函数)
        //即为:所有参数为可选∩(没有子命令∪有处理函数)
        if (
            (T.handler || T.subCommands.length == 0) &&
            T.paramBranches.every((t) => (t instanceof Array ? t.every((tt) => tt.optional) : t.optional))
        ) {
            ctx.usageList.push(
                `${T.isAdmin || ctx.command.isAdmin ? "§6" : ""}${priorStr}${priorStr.length ? " " : ""}${T.name} §r${
                    T.explain
                }`
            );
        }
        // 若有参数
        if (T.paramBranches.length > 0) {
            for (let branch of T.paramBranches) {
                const ctx1 = { usageList: [], cmdexplain: T.explain };
                PreOrdertraverse<ParamDefinition>(branch, {
                    getSubNodes: (T) => T.subParams,
                    enter: EnterParam,
                    ctx: ctx1,
                });
                ctx.usageList.push(
                    ...ctx1.usageList.map(
                        (t) =>
                            `${T.isAdmin || ctx.command.isAdmin ? "§6" : ""}${priorStr}${priorStr.length ? " " : ""}${
                                T!.name
                            } ${t}`
                    )
                );
            }
        }
    }
};
function getCommandUsage(command: Command, isop: boolean) {
    const ctx = { isop: isop, usageList: [], command: command };
    PreOrdertraverse(command, { getSubNodes: (T) => T.subCommands, enter: enterCommand, ctx: ctx });
    return ctx.usageList;
}

function paramFormat(param: ParamDefinition) {
    if (param.type == "flag") return param.name;
    const parentheses = param.optional ? "[]" : "<>";
    let paramType: string = param.type;
    //显示枚举类型
    if (param.type == "enum" && param.enums) {
        paramType = param.enums.join("|");
    }
    return parentheses[0] + param.name + ":" + paramType + parentheses[1];
}

function limittext(text: string, limit: number) {
    return text.length > limit ? text.slice(0, limit) + "..." : text;
}
