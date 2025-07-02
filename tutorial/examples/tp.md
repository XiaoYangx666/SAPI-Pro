```typescript
pcommand.registerCommand(
    Command.fromObject({
        name: "tp",
        explain: "传送测试",
        isAdmin: true,
        handler: (player, param) => {
            const des = param.destination as Player | Vector3;
            let desLoc;
            let dim;
            if (isVector3(des)) {
                desLoc = des;
                dim = player.dimension;
            } else {
                desLoc = des.location;
                dim = des.dimension;
            }
            const victim = param.victim as Player;
            if (victim) {
                system.run(() => {
                    victim.tryTeleport(desLoc, {
                        dimension: dim,
                        checkForBlocks: param.checkForBlocks,
                    });
                    victim.sendMessage(
                        "您已被传送至" + (des instanceof Player ? des.name : Vector3toArray(desLoc).join(","))
                    );
                });
            } else {
                system.run(() => {
                    player.tryTeleport(desLoc, {
                        dimension: dim,
                        checkForBlocks: param.checkForBlocks,
                    });
                    player.sendMessage(
                        "您已被传送至" + (des instanceof Player ? des.name : Vector3toArray(desLoc).join(","))
                    );
                });
            }
        },
        paramBranches: [
            [
                {
                    name: "destination",
                    type: "target",
                },
                {
                    name: "checkForBlocks",
                    type: "boolean",
                    optional: true,
                },
            ],
            {
                name: "victim",
                type: "target",
                branches: [
                    [
                        {
                            name: "destination",
                            type: "target",
                        },
                        {
                            name: "checkForBlocks",
                            type: "boolean",
                            optional: true,
                        },
                    ],
                    [
                        {
                            name: "destination",
                            type: "position",
                            branches: [
                                {
                                    name: "checkForBlocks",
                                    type: "boolean",
                                    optional: true,
                                },
                                [
                                    {
                                        name: "yRot",
                                        type: "int",
                                        optional: true,
                                    },
                                    {
                                        name: "xRot",
                                        type: "int",
                                        optional: true,
                                    },
                                    {
                                        name: "checkForBlocks",
                                        type: "boolean",
                                        optional: true,
                                    },
                                ],
                                {
                                    name: "facing",
                                    type: "flag",
                                    branches: [
                                        [
                                            {
                                                name: "lookAtPosition",
                                                type: "position",
                                            },
                                            {
                                                name: "checkForBlocks",
                                                type: "boolean",
                                            },
                                        ],
                                        [
                                            {
                                                name: "lookAtEntity",
                                                type: "target",
                                            },
                                            {
                                                name: "checkForBlocks",
                                                type: "boolean",
                                            },
                                        ],
                                    ],
                                },
                            ],
                        },
                    ],
                ],
            },
            {
                name: "destination",
                type: "position",
                branches: [
                    {
                        name: "checkForBlocks",
                        type: "boolean",
                        optional: true,
                    },
                    [
                        {
                            name: "yRot",
                            type: "int",
                            optional: true,
                        },
                        {
                            name: "xRot",
                            type: "int",
                            optional: true,
                        },
                        {
                            name: "checkForBlocks",
                            type: "boolean",
                            optional: true,
                        },
                    ],
                    {
                        name: "facing",
                        type: "flag",
                        branches: [
                            [
                                {
                                    name: "lookAtPosition",
                                    type: "position",
                                },
                                {
                                    name: "checkForBlocks",
                                    type: "boolean",
                                },
                            ],
                            [
                                {
                                    name: "lookAtEntity",
                                    type: "target",
                                },
                                {
                                    name: "checkForBlocks",
                                    type: "boolean",
                                },
                            ],
                        ],
                    },
                ],
            },
        ],
    })
);
```
