```ts
const spCommand: CommandObject = {
    name: "sp",
    explain: "打开假人面板",
    handler(player, args) {
        if (args.Action) {
            return spManager.mes(player, SPAction.call(args.Name, args.Action as any, player));
        }
        if (args.Name) {
            system.run(() => {
                const ans = spManager.Spawn(args.Name, player.location, {
                    dimension: player.dimension,
                    rotation: player.getRotation(),
                });
                if (typeof ans == "string") {
                    spManager.mes(player, ans);
                } else {
                    spManager.setLookAt(player, ans);
                }
            });
            return;
        }
        formManager.openNamed(player, "sp.main", {}, 10);
    },
    validator: (player) => {
        if (spManager.isLoaded()) return;
        formManager.openNamed(player, "sp.main", {}, 10);
        return "假人未初始化，请先初始化";
    },
    paramBranches: [
        {
            name: "Name",
            type: "string",
            validator: spNameValidator,
            optional: true,
            explain: "生成新的假人",
        },
        [
            {
                name: "Name",
                type: "string",
                validator: spValidator,
                optional: true,
            },
            {
                name: "Action",
                type: "enum",
                enums: ["jump", "follow", "break"],
                optional: true,
                explain: "假人动作",
            },
        ],
    ],
    subCommands: [
        {
            name: "init",
            explain: "初始化假人",
            handler: (p) => {
                system.run(async () => {
                    const ans = await spManager.initStructure();
                    spManager.mes(p, ans ? "初始化成功" : "初始化失败");
                });
            },
            validator: (player) => {
                return spManager.isLoaded() ? "已经初始化" : undefined;
            },
        },
        {
            name: "list",
            explain: "获取假人列表",
            handler: (p) => {
                const spList = spManager.getSPList();
                if (spList.length == 0) return spManager.mes(p, "当前没有假人");
                let i = 1;
                for (let data of spList) {
                    p.sendMessage(
                        `${i++}.${data.sp.name}:${dimName[data.sp.dimension.id]}§r(${Vector3Utils.toFixed(data.sp.location, 1)})`
                    );
                }
            },
        },
        {
            name: "kill",
            explain: "杀死假人",
            handler: (p, spname) => {
                const sp = spManager.getSPDatabyName(spname.SPName);
                if (sp)
                    system.run(() => {
                        spManager.Remove(sp.sp);
                    });
            },
            paramBranches: [
                {
                    name: "SPName",
                    type: "string",
                    validator: spValidator,
                },
            ],
        },
        {
            name: "facing",
            explain: "修改假人视角",
            handler(p, params) {
                const sp = spManager.getSPDatabyName(params.SPName);
                if (sp)
                    system.run(() => {
                        spManager.setLookAt(p, sp.sp);
                    });
            },
            paramBranches: [
                {
                    name: "SPName",
                    type: "string",
                    validator: spValidator,
                },
            ],
        },
        {
            name: "slot",
            explain: "切换假人手持物品",
            handler(p, params) {
                const sp = spManager.getSPDatabyName(params.SPName);
                if (!sp) return;
                system.run(() => {
                    spManager.useItem(sp.sp, params.slotId);
                });
            },
            paramBranches: [
                [
                    {
                        name: "SPName",
                        type: "string",
                        validator: spValidator,
                    },
                    {
                        name: "slotId",
                        type: "int",
                        validator: (value: number) => {
                            if (value > 36 || value < 0) {
                                return "slotId必须在0-36之间";
                            }
                            // 通过则无需返回值
                        },
                    },
                ],
            ],
        },
        {
            name: "use",
            explain: "假人使用物品",
            handler(p, params) {
                const sp = spManager.getSPDatabyName(params.SPName);
                if (!sp) return;
                system.run(() => {
                    spManager.useItemOnBlock(sp.sp, params.slotId);
                });
            },
            paramBranches: [
                [
                    {
                        name: "SPName",
                        type: "string",
                        validator: spValidator,
                    },
                    {
                        name: "slotId",
                        type: "int",
                        validator: (value: number) => {
                            if (value > 36 || value < 0) {
                                return "slotId必须在0-36之间";
                            }
                            // 通过则无需返回值
                        },
                    },
                ],
            ],
        },
    ],
};
pcommand.registerCommand(Command.fromObject(spCommand));
pcommand.registerNative(
    new Command("sp", "打开假人管理面板", false, (p) => formManager.openNamed(p, "sp.main"))
);
```
