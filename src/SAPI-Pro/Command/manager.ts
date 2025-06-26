import { ChatSendBeforeEvent, CustomCommandOrigin, CustomCommandResult, CustomCommandSource, CustomCommandStatus, Player, system } from "@minecraft/server";
import { LibConfig } from "SAPI-Pro/Config";
import { exchangedb } from "SAPI-Pro/DataBase";
import { chatBus } from "SAPI-Pro/Event";
import { Command } from "./commandClass";
import { CommandHelp } from "./help";
import { CommandParser } from "./parser/parser";

//命令管理类
export class CommandManager {
    commands: Map<string, Command>;
    nativeCommands: Command[] = [];
    nativeNameSpace: string = "sapipro";
    testMode = false;
    help?: CommandHelp;

    constructor(private readonly parser: CommandParser) {
        this.commands = new Map();
        chatBus.subscribe(this.runCommand.bind(this));
        //注册原生指令
        system.beforeEvents.startup.subscribe((t) => {
            this.nativeCommands.forEach((cmd) => {
                t.customCommandRegistry.registerCommand(cmd.toNative(this.nativeNameSpace), (origin: CustomCommandOrigin, ...args: any[]) => {
                    return this.runNativeCommand(cmd, origin, args);
                });
            });
        });
    }

    init(help: CommandHelp) {
        this.help = help;
    }

    /** 注册命令 */
    registerCommand(command: Command) {
        // prettier-ignore
        if (command.name != "help"&&this.help!=undefined) {
            command.addSubCommand(new Command("help","获取帮助",false,(player, args) => {
                this.help!.handleCommandHelp(player,command);
            },
            undefined,true));
        }
        this.commands.set(command.name, command);
    }

    /**注册原生指令 */
    registerNative(command: Command) {
        this.nativeCommands.push(command);
    }

    /**原生指令设置命名空间 */
    setNameSpace(nameSpace: string) {
        this.nativeNameSpace = nameSpace;
    }

    /**客户端注册指令，系统调用，不管 */
    regToHost() {
        if (LibConfig.UUID == undefined) return;
        const obj = [...this.commands.entries()].reduce((obj: any, [key, value]) => ((obj[key] = value), obj), {});
        return exchangedb.edit((data) => {
            data["cmd"][LibConfig.UUID!] = obj;
        });
    }
    /**注册客户端命令(系统调用，不用管) */
    regClientCommand() {
        try {
            const commandObj = exchangedb.get("cmd") as Record<string, Record<string, Command>>;
            for (let commands of Object.values(commandObj)) {
                for (let [name, command] of Object.entries(commands)) {
                    if (!this.commands.has(name)) {
                        command.isClientCommand = true;
                        this.commands.set(name, command);
                    }
                }
            }
        } catch (err) {
            console.warn("命令注册失败");
        }
    }

    /** 运行命令注册回调*/
    runCommand(t: ChatSendBeforeEvent) {
        if (!(t.message.length > 0 && t.message[0] === ".")) return;
        let msg = t.message.slice(1);
        return this.parser.parseCommand(msg, t.sender);
    }

    parseCommand(input: string, player: Player) {
        this.parser.parseCommand(input, player);
    }

    runNativeCommand(command: Command, origin: CustomCommandOrigin, ...args: any[]): CustomCommandResult | undefined {
        //判断是否玩家
        if (origin.sourceType != CustomCommandSource.Entity || origin.sourceEntity?.typeId != "minecraft:player") {
            return { message: "该指令只能由玩家执行", status: CustomCommandStatus.Failure };
        }
        const ans = this.parser.parseSubCommand(command, args.flat(), origin.sourceEntity as Player, false);
        //执行失败
        if (typeof ans == "string") return { message: JSON.stringify(args), status: CustomCommandStatus.Failure };
        return { status: CustomCommandStatus.Success };
    }

    getCommandInfo(command: string) {
        return this.commands.get(command);
    }

    getCommandsList(admin: boolean) {
        if (admin) {
            return [...this.commands.keys()];
        } else {
            return [...this.commands.keys()].filter((t) => !this.getCommandInfo(t)?.isAdmin);
        }
    }
}
