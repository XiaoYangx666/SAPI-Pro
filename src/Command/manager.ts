import {
    ChatSendBeforeEvent,
    CustomCommandOrigin,
    CustomCommandResult,
    CustomCommandSource,
    CustomCommandStatus,
    Player,
    StartupEvent,
    system,
} from "@minecraft/server";
import { LibConfig } from "../Config";
import { exchangedb } from "../DataBase/DataBase";
import { chatBus } from "../Event";
import { Command } from "./commandClass";
import { CommandHelp } from "./help";
import { CommandParser } from "./parser/parser";
import { NativeCommandParser } from "./parser/nativeParser";

//命令管理类
export class CommandManager {
    readonly commands: Map<string, Command>;
    readonly nativeCommands: Command[] = [];
    testMode = false;
    help?: CommandHelp;

    constructor(
        private readonly parser: CommandParser,
        private readonly nativeParser: NativeCommandParser
    ) {
        this.commands = new Map();
        chatBus.subscribe(this.runCommand.bind(this));
        //注册原生指令
        system.beforeEvents.startup.subscribe(this.registerNativeCommands.bind(this));
    }

    init(help: CommandHelp) {
        this.help = help;
    }

    /**注册所有原生命令 */
    private registerNativeCommands(t: StartupEvent) {
        this.nativeCommands.forEach((cmd) => {
            const nativeData = cmd.toNative(LibConfig.packInfo.nameSpace);
            // 1. 自动遍历并注册属于该命令的所有 Enum
            for (const [enumName, enumValues] of Object.entries(nativeData.enums)) {
                t.customCommandRegistry.registerEnum(enumName, enumValues);
            }
            // 2. 注册主命令
            t.customCommandRegistry.registerCommand(
                nativeData.cmd,
                (origin: CustomCommandOrigin, ...args: any[]) => {
                    return this.runNativeCommand(cmd, origin, args);
                }
            );
        });
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

    /**客户端注册指令，系统调用，不管 */
    regToHost() {
        if (LibConfig.packInfo.uuid == undefined) return;
        const obj = [...this.commands.entries()].reduce(
            (obj: any, [key, value]) => ((obj[key] = value), obj),
            {}
        );
        return exchangedb.edit((data) => {
            data["cmd"][LibConfig.packInfo.uuid!] = obj;
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

    private runNativeCommand(
        command: Command,
        origin: CustomCommandOrigin,
        args: any[]
    ): CustomCommandResult | undefined {
        //判断是否玩家
        if (
            origin.sourceType != CustomCommandSource.Entity ||
            origin.sourceEntity?.typeId != "minecraft:player"
        ) {
            return { message: "该指令只能由玩家执行", status: CustomCommandStatus.Failure };
        }
        const ans = this.nativeParser.parseAndExecute(command, origin.sourceEntity as Player, args);
        //执行失败
        return ans;
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
