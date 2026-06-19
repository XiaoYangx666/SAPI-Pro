# 命令系统 Reference

## Examples

复杂命令请参考：

- [假人实际命令](../examples/cmd/sp.md)
- [复杂 TP 命令（多分支、Flag）](../examples/cmd/tp.md)

---

## 注册命令

注意：

- `registerCommand()` 注册模拟 `.` 命令
- `registerNative()` 注册游戏 `/` 命令
- 仅 Beta 版 SAPI-Pro 支持模拟命令
- Stable 版仅支持 Native 命令

简单命令：

```ts
const cmd = new Command("test", "测试命令", false, (player, args) => {
    player.sendMessage(args.Name);
});

cmd.addParam({
    name: "Name",
    type: "string",
});

pcommand.registerCommand(cmd);
```

复杂命令：

```ts
pcommand.registerCommand(Command.fromObject(command));
```

原生命令：

```ts
pcommand.registerNative(command);
```

---

# Command

适用于：

```text
参数较少
无子命令
无复杂分支
```

示例：

```ts
const cmd = new Command("ping", "测试命令", false, (player) => {
    player.sendMessage("pong");
});

pcommand.registerCommand(cmd);
```

---

# CommandObject

适用于：

```text
多子命令
多参数分支
复杂命令树
```

示例：

```ts
const command: CommandObject = {
    name: "sp",
    explain: "假人管理",

    subCommands: [
        {
            name: "list",

            handler(player) {
                // ...
            },
        },

        {
            name: "kill",

            handler(player, args) {
                // ...
            },
        },
    ],
};

pcommand.registerCommand(Command.fromObject(command));
```

更多结构请参考 Examples。

---

# Native Command

```ts
pcommand.registerNative(command);
```

限制：

```text
不支持子命令
不支持多参数分支
```

推荐用于：

```text
/test
/test <arg>
/test <mode: a|b|c> [value:string]
```

## Native 命令特性

支持 `itemType`、`blockType`、`entityType` 等 Minecraft 原生参数类型（原生命令提示会自动补全），支持实体选择器，支持多个玩家选择。

`enum` 和 `flag` 参数会自动注册到 `registerEnum`，玩家输入时会有下拉提示。

示例：

```ts
pcommand.registerNative(
    Command.fromObject({
        name: "giveitem",
        explain: "给予物品",
        handler(player, args) {
            const item = new ItemStack(args.item as ItemType);
            player.getComponent("inventory").container.addItem(item);
        },
        paramBranches: [
            { name: "item", type: "itemType" },
            { name: "count", type: "int", optional: true },
        ],
    })
);
```

## Native命令 vs 模拟命令

模拟命令仅限beta版使用，支持多参数分支和子命令，玩家与实体选择器支持不完善，建议需要子命令时使用。
native命令支持beta版与stable版，不支持参数分支，无参或三个参数以内的命令可以使用。

---

# ParamType 完整列表

```ts
flag       // 记号/标志
boolean    // true|false
enum       // 枚举（限定 enums 中的值）
int        // 整数
float      // 小数
target     // 单个玩家选择器 → Player
player //玩家选择器(仅native)
entity //实体选择器(仅native)
position   // 坐标 → Vector3
string     // 字符串
itemType   // 物品类型 → ItemType
blockType  // 方块类型 → BlockType
entityType // 实体类型 → EntityType
```
