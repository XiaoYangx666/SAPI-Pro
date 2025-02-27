import { system } from "@minecraft/server";
import { ScriptEventBus } from "SAPI-Pro/Event";
import { getAllPlayers } from "SAPI-Pro/func";
import { pcommand } from "./main";
let tests = [
    "tp @s @s",
    "tp ~~~",
    "tp aaaaaa",
    "tp ~~~ ~~~",
    "tp @r @s",
    "tp 114514 100 114514 0 0 true",
    "tp 114514 100 114514 0 0 fuck",
    "sp init",
    "sp sb jump",
    'sp @"[假人]sb" follow',
    "res new",
    "res ls aaa",
    "res ls sb",
    "res ls",
    "res lsf",
    "help help",
    "help 4",
    "yuanshen qidong",
    "fuck you beach",
    "help help aaa",
    "tp @XiaoYangx666 ~~~",
    "res new aaaaaaaaa",
    "sp dsbaaaaaaaa aaaaaaaaaa",
    "tpa @XiaoYangx666",
    "db list",
    "db list aaa",
    "db help",
    "db keys Config",
    "db get Config aichat",
    "sorter",
];
ScriptEventBus.bind("test:cmd", (t) => {
    let round = parseInt(t.message);
    const player = getAllPlayers()[0];
    console.warn(`测试集大小${tests.length},测试轮数:${round},总命令条数:${tests.length * round}`);
    system.run(async () => {
        const timeStart = Date.now();
        for (let i = 0; i < round; i++) {
            for (let test of tests) {
                pcommand.parseCommand(test, player);
            }
        }
        const timeEnd = Date.now();
        console.warn("测试结束，耗时" + (timeEnd - timeStart) + "ms");
    });
});
