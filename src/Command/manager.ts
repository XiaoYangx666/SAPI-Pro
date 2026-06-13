import { LibConfig } from "@/Config";
import {
    CustomCommandOrigin,
    CustomCommandResult,
    CustomCommandSource,
    CustomCommandStatus,
    Player,
    StartupEvent,
    system,
} from "@minecraft/server";
import { Command } from "./commandClass";
import { NativeCommandParser } from "./parser/nativeParser";

//命令管理类
export class CommandManager {
    readonly commands: Map<string, Command>;
    readonly nativeCommands: Command[] = [];
    testMode = false;

    constructor(private readonly nativeParser: NativeCommandParser) {
        this.commands = new Map();
        //注册原生指令
        system.beforeEvents.startup.subscribe(this.registerNativeCommands.bind(this));
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

    /**注册原生指令 */
    registerNative(command: Command) {
        this.nativeCommands.push(command);
    }

    runNativeCommand(
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
}
