# SAPI-Pro

![Requires](https://img.shields.io/badge/依赖-SAPI%201.18%20Beta-red) ![Support](https://img.shields.io/badge/支持版本-MCBE1.21.6x-green)

[简体中文](readme.md)|[English](readme_en.md)

## 核心特性

-   **命令解析**：支持多参数多分支命令解析与帮助显示
-   **表单管理**：自动管理表单上下文，及多层表单操作
-   **数据存储**：动态数据与计分板存储，支持超大文本分割
-   **多行为包支持**：使用 SAPI-Pro 的行为包可以互相调用表单及命令

---

## 快速开始

### 📦 安装方式

#### 方式一：基础模板创建（推荐）

如果你想基于 SAPI-Pro 创建新的脚本行为包，你可以直接下载最新版本基础包。并从零开始创建你的新项目

1. [下载最新基础包]()
2. 修改行为包配置

```json
{
    // manifest.json
    "header": {
        "description": "SAPI-Pro示例行为包", //改描述
        "name": "SAPI-Pro示例行为包", //改名字
        "uuid": "9db8c694-0dc1-4263-a2c1-2cd8c2f29a9a", //该uuid
        "version": [1, 0, 0]
        //...
    },
    "modules": [
        {
            //...
            "uuid": "aa930053-5c73-4e59-9c97-272c35e4eb80" //改uuid
            //...
        }
    ]
}
```

3. 修改库配置

```typescript
// src/SAPI-Pro/Config.ts
export const packInfo: PackInfo = {
    name: "SAPI-Pro行为包", //行为包名
    version: 0.1, //行为包版本
    author: "XiaoYangx666", //作者
};
```

4. 编写代码
   完成配置后，你可以开始在`src/main.ts`中编写代码，通过`import`引入 SAPI-Pro 相关类。使用 tsc 编译为 js 既可以运行。

> **提示**  
> 如果你不使用 TypeScript，你可以直接删除 src 和 tsconfig 等文件。并在`scripts/SAPI-Pro/Config.js`中修改库配置。并直接在 scripts/main.js 中写代码。
> 不要删除 main.ts 中的`import "./SAPI-Pro/main";`库需要初始化才能正常使用

#### 方式二：现有项目集成

1. 选择版本：[JavaScript 版]() | [TypeScript 版]()

2. 将库文件解压至项目目录：(JS 版本同理)

    ```bash
    📂 your_project/
    └── 📂 src/
        └── 📂 SAPI-Pro/
            ├── Command/
            ├── DataBase/
            └── main.ts
    ```

3. 初始化库：
    ```typescript
    // 主入口文件
    import "./SAPI-Pro/main";
    ```

---

## 核心模块详解

### 🎮 命令系统

你可以使用两种方式来注册命令，即直接创建 Command 对象或使用`Command.fromObject`来创建。在命令较为复杂时，推荐从对象创建命令。

以下是两个简单的命令注册示例，通过 `param.name` 即可获得解析后的参数。你还可以创建更为复杂的命令，包含子命令、多个参数分支等,请阅读[命令注册]()。

#### 命令示例

```typescript
import { Player, system } from "@minecraft/server";
import { Command, pcommand } from "SAPI-Pro/Command/main";

const ExampleCmd = new Command("test", "命令测试", false, (player, param) => {
    player.sendMessage("SAPI-Pro，启动！");
});
const killCmd = Command.fromObject({
    name: "kill", //命令名
    explain: "紫砂", //命令解释
    handler(player, param) {
        //命令处理函数
        const p = param.Player as Player;
        system.run(() => {
            p.kill(); //只读模式，需要使用system.run
        });
    },
    paramBranches: [
        //参数
        {
            name: "Player",
            type: "target",
        },
    ],
});
//注册
pcommand.registerCommand(ExampleCmd);
pcommand.registerCommand(killCmd);
```

#### 性能

实测 10000 条命令解析耗时 1100ms，平均 9 条/ms。1tick 可解析 300+命令，完全够用。

---

### 📋 表单管理

通过 SAPI-Pro，你可以方便的进行表单管理，不管是创建表单，还是多层次表单，都无比轻松。此外，还内置了一些常用表单，如 ButtonForm,ButtonListForm 等，详见[常用表单]()。

#### 表单示例

```typescript
//注册表单
FormManager.register({
    id: "test",
    builder: (player, ctx) => {
        const form = new ModalFormData().title("测试表单").textField("1+1=?", "114514");
        ctx.ans = 2;
        return form;
    },
    handler: (player, res: ModalFormResponse, ctx) => {
        if (res.formValues) {
            if (parseInt(res.formValues[0] as string) == ctx.ans) {
                player.sendMessage("666答对了");
                return;
            }
        }
        player.sendMessage("菜，就多练");
        return { type: NavType.REOPEN };
    },
});
//注册打开表单的命令
pcommand.registerCommand(
    new Command("formtest", "表单测试", false, (player) => {
        FormManager.open(player, "test", {}, 10);
    })
);
```

以上是一个简单的让用户不断输入的表单的部分代码，使用了`FormManager.register`注册表单。并使用`FormManager.open`来向用户展示表单。表单还有更多用法，请查阅[表单管理]()。

---

### 💾 数据存储

数据存储方面，SAPI-Pro 提供了三个类：`DPDataBase`,`ScoreBoardJSONDataBase`和`ScoreBoardDataBase`。封装了原版的数据存储，使得更方便快捷，并支持超大文本分割存储。[存储 10 本小说]()也没有问题。

#### 动态存储示例

```typescript
import { Configdb } from "SAPI-Pro/DataBase";
Configdb.set("test", 1); //存储数值(还可以存string,Vector3,boolean)
Configdb.setJSON("info", { author: "XiaoYangx666", version: 0.1 }); //存储对象
const testValue = Configdb.get("test") as number;
const info = Configdb.getJSON("info") as any;
world.sendMessage(testValue.toString());
world.sendMessage(info.author);
```

> 输出
> 1
> XiaoYangx666

---

## 示例行为包

[自动整理]()
[MCBE 音乐播放器]()
[简单假人]()

## 参考文档

[SAPI-Pro 参考文档](docs/globals.md)

## 支持与贡献

欢迎各位大佬莅临修改

问题反馈：<2408807389@qq.com>  
GitHub 仓库：[https://github.com/XiaoYangx666/SAPI-Pro](https://github.com/XiaoYangx666/SAPI-Pro)
Gitee 仓库 : [gitee.com/ykxyx666_admin/SAPI-Pro](gitee.com/ykxyx666_admin/SAPI-Pro)

> 🛠️ 推荐开发环境：
>
> -   VSCode
> -   TypeScript 4.7+
> -   Node.js 20+
