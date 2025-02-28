**Documentation**

---

## 命令注册

> 此文档纯手工编辑，未使用 AI

### 方式 1：通过构造函数注册

此方式适用于参数和子命令较少的简单命令。

使用 `const CommandName = new Command(参数)` 即可创建一个新命令。其中，`Command` 构造函数按顺序需要以下参数：

-   `name: string` - 命令名
-   `explain: string` - 命令说明
-   `isAdmin: boolean` - 是否为管理员命令
-   `handler?: commandHandler` - 命令处理函数（可选）
-   `validator?: CommandValidator` - 命令验证器（可选）
-   `isHidden: boolean = false` - 是否隐藏命令(不会显示在 help 中,默认不隐藏)
-   `isClient: boolean = false` - 是否为客户端命令（系统调用，不用管）

所以，首先，创建一个新的命令对象

```typescript
import { pcommand, Command } from "SAPI-Pro/Command/main";
const exampleCmd = new Command("test", "命令测试", false, (player, param) => {
    player.sendMessage("你输入的是" + param.Name);
}); //创建命令对象
```

然后，为它添加参数并注册它

```typescript
exampleCmd.addParam({
    name: "Name",
    type: "string",
}); //添加单个参数
pcommand.registerCommand(exampleCmd); //注册命令
```

就这么简单，你就添加了一个简单的命令。

以下是对几个重要参数的解释。

#### handler?:commandHandler

`(player: Player, params: Record<string,any>) => void;`
其中，handler 是一个回调函数，包含两个参数`player,param`，player 为执行命令的玩家，param 是解析后的参数对象，如果命令解析成功，那么 param 里会有成功解析的参数，如上代码中,使用 param.Name 获取了参数值，而如果没有解析成功，则不会调用命令处理函数。

此外，如果有多个分支，命令可能进入不同分支，从而解析的参数也不同，因此建议在使用参数前先判断是否存在，再根据参数存在情况，选择不同处理方式。

#### validator?:CommandValidator

`
CommandValidator:(player: Player)=> true | string;`

这是命令验证器，验证命令是否应该执行。应该执行则应返回 true,否则应该返回错误提示。
如果命令验证不通过，则所有子命令及参数都不会被解析，也不会被执行。

#### 示例

以下是一个包含 `handler`和`validator`的简单命令示例

```typescript
const tpaCommand = new Command("tpa", "打开传送面板", false, (player, args) => {
    if (args.PlayerName == undefined) {
        FormManager.open(player, "tpa.main", {}, 10);
        return;
    }
    if (args.PlayerName) {
        Tpa.call(player, args.PlayerName);
    }
});

tpaCommand.addParam({
    name: "PlayerName",
    type: "target",
    optional: true,
    explain: "向玩家发送传送请求",
    validator: (value: Player, player) => {
        if (value == player) return "§3[传送系统]§r你不能向自己发送请求";
        if (getAllPlayers().length < 1) return "§3[传送系统]§r无玩家可供传送";
        return true;
    },
});
pcommand.registerCommand(tpaCommand); //注册命令
```

示例中实现了一个 tpa 命令，通过 validator 判断是否符合条件，并通过 `type:"target"`限制参数是玩家类型，直接拿到玩家对象。全部验证通过后，将会执行 tpa 操作。

此外命令对象还有多个函数:`addParams`，`addParamBranches`，`addSubCommand`，`addSubCommands`。它们可以为命令添加参数，添加子命令，在此不详细介绍。

因为当命令较为复杂时建议使用方式 2 来注册命令。

---

### 方式 2：通过 CommandObject 注册

当遇到命令复杂，子参数多或参数多，分支多的时候，使用这种方式更加方便。

首先创建一个 CommoandObject 对象如下

```typescript
const myCommand: CommandObject = {
    name: "test",
    explain: "测试命令",
    handler(player, params) {
        world.sendMessage(player.name);
    },
    //其它命令参数
};
```

然后仍然用 `pcommand.registerCommand()`来注册命令。  
不同的是，你需要先将 CommandObject 转为命令类型才能注册。这使用的是`Command.fromObject(CommandObject)`

```typescript
pcommand.registerCommand(Command.fromObject(myCommand)); //注册命令
```

CommondObject 是一个 interface，还有更多参数，并需要遵循以下结构:

```typescript
interface CommandObject {
    name: string; //命令名
    explain: string; //命令解释
    isAdmin?: boolean; //是否管理员命令,默认不是
    isHiden?: boolean; //是否隐藏命令(不会显示在help中)
    handler?: commandHandler; //命令处理器
    validator?: CommandValidator; //命令验证器
    paramBranches?: paramBranches[]; //命令参数分支
    subCommands?: CommandObject[]; //子命令列表
    isClientCommand?: boolean; //不用管，系统使用
}
```

大部分参数和方式 1 中一样，需要注意的是`subCommands`和`paramBranches`。

#### subCommands 子命令数组

你可以在这里添加子命令，每个子命令仍然是 CommnadObject 类型。因此你可以为子命令添加子命令。

例如:

```typescript
const subCommandsTest: CommandObject = {
    name: "test1",
    explain: "子命令测试",
    subCommands: [
        {
            name: "show",
            explain: "显示执行命令的玩家",
            handler(player, params) {
                world.sendMessage(player.name);
            },
        },
        {
            name: "loc",
            explain: "显示执行命令玩家位置",
            handler(player, params) {
                world.sendMessage(Vector3toArray(player.location).join(","));
            },
            subCommands: [
                //这里可以写子命令的子命令列表
            ],
        },
    ],
};
```

#### paramBranches 参数分支

为什么要叫参数分支呢？因为不用分支较难实现复杂的分支参数。  
这也是一个数组，但其中可以放两种东西:`ParamObject`和`ParamObject[]`。其中 ParamObject 定义如下

```typescript
interface ParamObject {
    name: string; //参数名
    type: keyof typeof paramTypes; //参数类型
    enums?: string[]; //枚举值
    optional?: boolean; //是否可选，默认否
    default?: parsedTypes; //默认值
    explain?: string; //参数解释
    validator?: ParamValidator; //参数验证器
    branches?: paramBranches[]; // 子参数分支
}
```

而 paramTypes 可以是以下类型

```typescript
enum paramTypes {
    flag, //记号
    boolean, //true|false
    enum, //枚举(只能是enums中的值)
    int, //整数
    float, //小数
    target, //玩家
    position, //Vector3坐标
    string, //字符串
}
```

如果你只想为命令/子命令添加一条分支，如`.db get <DBname:string> <key:string>`这样的。你可以将多个参数放到一个数组里，再把这个数组放到 paramBranches 的数组里，就像这样：

##### 示例

```typescript
const cmd = Command.fromObject({
    name: "db",
    explain: "数据库调试命令",
    isAdmin: true,
    subCommands: [
        {
            name: "get",
            explain: "获取数据库值",
            paramBranches: [
                [
                    //一条参数分支
                    { name: "DBname", type: "string", validator: dbValidator },
                    { name: "key", type: "string" },
                    { name: "full", type: "boolean", optional: true },
                ],
            ],
            handler: (player, args) => {
                //省略
            },
        },
    ],
});
```

如果一条参数分支里只有一个参数，那么这个参数分支的大括号可以省略。

而如果你需要多个参数分支，可以参考如下部分代码：(只展示了命令结构，具体处理代码已省略，完整版见[简单假人]())

##### 进阶示例

```typescript
const spCommand: CommandObject = {
    name: "sp",
    explain: "打开假人面板",
    handler(player, args) {
        if (args.Action) {
            //假人动作
        }
        if (args.Name) {
            //生成假人
        }
        FormManager.open(player, "sp.main", {}, 10);
    },
    validator: (player) => {
        return spManager.isLoaded() ? true : "假人未初始化，请先初始化";
    },
    paramBranches: [
        {
            //只有一个参数，这条参数分支的[]省略
            name: "Name",
            type: "string",
            validator: spNameValidator,
            optional: true,
            explain: "生成新的假人",
        },
        [
            //第二条参数分支
            {
                name: "Name",
                type: "string",
                validator: spValidator,
                optional: true,
            },
            {
                name: "Action",
                type: "enum",
                enums: ["jump", "follow"],
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
                //省略
            },
            validator: (player) => {
                return spManager.isLoaded() ? "已经初始化" : true;
            },
        },
        {
            name: "list",
            explain: "获取假人列表",
            handler: (p) => {
                //省略了
            },
        },
        {
            name: "kill",
            explain: "杀死假人",
            handler: (p, spname) => {
                //省略
            },
            paramBranches: [
                {
                    name: "SPName",
                    type: "string",
                    validator: spValidator,
                },
            ],
        },
    ],
};
pcommand.registerCommand(Command.fromObject(spCommand));
```

以上代码实现的命令结构如下:

```
.sp 打开假人面板
.sp [Name:string] 生成新的假人
.sp [Name:string] [Action:jump|follow] 假人动作
.sp init 初始化假人
.sp list 获取假人列表
.sp kill <SPName:string> 杀死假人
```

可以看出，在 sp 命令下实现了两条参数分支。

### 更多示例

如果要实现更多更复杂的参数分支，可以参考[tp 命令复刻]()，此例子完整的实现了基岩版的 tp 命令的结构，包含多参数分支，和参数分支的子分支。

### 附录

> 命令解析简易流程:
>
> 1.  寻找匹配的命令或子命令
> 2.  判断命令权限
> 3.  运行命令自定义校验
> 4.  深度搜索解析命令参数分支
>     1.  参数解析
>         1.  参数是否充足
>         2.  正则校验
>         3.  转换参数及验证
>         4.  自定义校验器
>     2.  处理解析结果
> 5.  返回结果
