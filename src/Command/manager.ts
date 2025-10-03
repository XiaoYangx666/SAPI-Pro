import {
    CustomCommandOrigin,
    CustomCommandResult,
    CustomCommandSource,
    CustomCommandStatus,
    Player,
    system,
} from "@minecraft/server";
import { LibConfig } from "../Config";
import { Command } from "./commandClass";
import { CommandParser } from "./parser/parser";

//命令管理类
export class CommandManager {
    commands: Map<string, Command>;
    nativeCommands: Command[] = [];
    testMode = false;

    constructor(private readonly parser: CommandParser) {
        this.commands = new Map();
        //注册原生指令
        system.beforeEvents.startup.subscribe((t) => {
            this.nativeCommands.forEach((cmd) => {
                t.customCommandRegistry.registerCommand(
                    cmd.toNative(LibConfig.packInfo.nameSpace),
                    (origin: CustomCommandOrigin, ...args: any[]) => {
                        return this.runNativeCommand(cmd, origin, args);
                    }
                );
            });
        });
    }

    /**注册原生指令 */
    registerNative(command: Command) {
        this.nativeCommands.push(command);
    }

    runNativeCommand(
        command: Command,
        origin: CustomCommandOrigin,
        ...args: any[]
    ): CustomCommandResult | undefined {
        //判断是否玩家
        if (
            origin.sourceType != CustomCommandSource.Entity ||
            origin.sourceEntity?.typeId != "minecraft:player"
        ) {
            return { message: "该指令只能由玩家执行", status: CustomCommandStatus.Failure };
        }
        const ans = this.parser.parseSubCommand(
            command,
            args.flat(),
            origin.sourceEntity as Player,
            false
        );
        //执行失败
        if (typeof ans == "string")
            return { message: JSON.stringify(args), status: CustomCommandStatus.Failure };
        return { status: CustomCommandStatus.Success };
    }
}
