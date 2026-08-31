import {
    CustomCommandOrigin,
    CustomCommandResult,
    CustomCommandSource,
    CustomCommandStatus,
    Player,
    RawMessage,
    StartupEvent,
    system,
} from "@minecraft/server";
import { LibConfig } from "../Config";
import { exchangedb } from "../DataBase/DataBase";
import { chatOpe, ChatSendBeforeEventLike } from "../Event";
import { Command } from "./commandClass";
import { NativeCommandParser } from "./parser/nativeParser";

/**
 * 模拟命令解析器（聊天触发的 `.命令`）的最小接口。
 *
 * 仅 beta 渠道存在实现（`CommandParser`）；stable 渠道 `__BETA__` 为 false，
 * 该解析器整段死代码消除、不进入产物，`CommandManager` 的 parser 为 undefined。
 * 用结构接口而非直接引用 `CommandParser`，保证 stable 的 .d.ts 不依赖 `./parser/parser` 模块。
 */
export interface SimulatedParserLike {
    parseCommand(input: string, player: Player): void | chatOpe;
    dispatchError(
        player: Player,
        showError: boolean,
        errorMsg: RawMessage | string
    ): void | RawMessage;
    buildSyntaxError(
        command: Command,
        value: string | undefined,
        params: string[],
        current: number,
        tip?: string | RawMessage
    ): RawMessage;
}

/**
 * 自定义 help 命令的最小接口。
 *
 * 仅 beta 渠道存在实现（`CommandHelp`，模拟命令 `.help`）；stable 渠道游戏自带 `/help`，
 * 不需要自定义 help，`CommandManager.help` 恒为 undefined。用结构接口避免 .d.ts 依赖 `./help` 模块。
 */
export interface HelpLike {
    handleCommandHelp(player: Player, command: Command): void;
}

//命令管理类
export class CommandManager {
    readonly commands: Map<string, Command>;
    readonly nativeCommands: Command[] = [];
    testMode = false;
    help?: HelpLike;

    constructor(
        private readonly parser: SimulatedParserLike | undefined,
        private readonly nativeParser: NativeCommandParser
    ) {
        this.commands = new Map();
        //注册原生指令
        system.beforeEvents.startup.subscribe(this.registerNativeCommands.bind(this));
    }

    init(help: HelpLike | undefined) {
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

    /** 注册模拟命令（仅 beta 渠道的聊天触发 `.命令`）；stable 渠道只允许 registerNative 注册原生命令 */
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

    /** 运行命令注册回调（仅 beta 渠道被 chatBus 订阅） */
    runCommand(t: ChatSendBeforeEventLike) {
        if (!(t.message.length > 0 && t.message[0] === ".")) return;
        let msg = t.message.slice(1);
        return this.parser?.parseCommand(msg, t.sender);
    }

    /** 编程式解析一条模拟命令；stable 渠道无解析器，调用为无操作 */
    parseCommand(input: string, player: Player) {
        this.parser?.parseCommand(input, player);
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
        return this.commands.get(command) ?? this.nativeCommands.find((t) => t.name === command);
    }

    getCommandsList(admin: boolean) {
        const all = [
            ...new Set([...this.commands.keys(), ...this.nativeCommands.map((t) => t.name)]),
        ];
        if (admin) {
            return all;
        } else {
            return all.filter((t) => !this.getCommandInfo(t)?.isAdmin);
        }
    }
}
