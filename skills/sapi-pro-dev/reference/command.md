# 命令系统 Reference

## Examples

复杂命令请参考：

- [假人实际命令](../examples/cmd/sp.md)
- [复杂 TP 命令（多分支、Flag）](../examples/cmd/tp.md)

---

## 注册命令

注意：

- `registerCommand()` 注册模拟 `.` 命令
- 仅 Beta 版 SAPI-Pro 支持
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
不支持复杂参数分支
```

推荐用于：

```text
/test
/test <arg>
```
