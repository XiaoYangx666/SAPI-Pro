import { Player } from "@minecraft/server";
import { Command, commandParser } from "./main";
interface helpCommandParam {
    page?: number;
    commandName?: string;
}
export declare class CommandHelp {
    private pcommand;
    private helpCommand;
    constructor(pcommand: commandParser);
    commandHelp(player: Player, args: helpCommandParam): void;
    handlePageHelp(player: Player, page: number): void;
    handleCommandHelp(player: Player, command: Command): void;
}
export {};
