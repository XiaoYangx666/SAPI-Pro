**sapi-pro**

***

# SAPI-Pro

![Requires](https://img.shields.io/badge/依赖-SAPI%202.1.0%20Beta-red) ![Support](https://img.shields.io/badge/支持版本-MCBE1.21.9x-green)

[简体中文](_media/README.md)|[English](_media/README_EN.md)

## 目录

-   [安装](#安装)
    -   [从模板创建(推荐)](#方式一从模板创建推荐)
    -   [现有项目集成](#方式二现有项目集成)
-   [核心功能](#核心功能)
    -   [命令系统](#命令系统)
    -   [表单导航](#表单导航)
    -   [数据存储](#-数据存储)
    -   [多包通信](#多包通信)
-   [示例行为包](#示例行为包)
-   [参考文档](#参考文档)
-   [支持与贡献](#支持与贡献)

---

## 📦 安装

### 方式一：从模板创建（推荐）

如果你想基于 SAPI-Pro 创建新的脚本行为包，你可以直接下载最新版本模板包。模板包提供了基础的配置，并提供了打包脚本，更新脚本等，更加方便。

1. [从 Gitee 下载](https://gitee.com/ykxyx666_admin/SAPI-Pro/releases/latest)|[从 Github 下载](https://github.com/XiaoYangx666/SAPI-Pro/releases/latest)
2. 修改行为包配置(manifest.json)

```json
{
    "header": {
        "description": "SAPI-Pro示例行为包(请修改描述)",
        "name": "SAPI-Pro示例行为包(请修改名字)",
        "uuid": "9db8c694-0dc1-4263-a2c1-2cd8c2f29a9a(改uuid)",
        "version": [1, 0, 0]
    },
    "modules": [
        {
            "uuid": "aa930053-5c73-4e59-9c97-272c35e4eb80(改uuid)"
        }
    ]
}
```

3. 修改包信息

```typescript
// src/packInfo.ts
// 或scripts/packInfo.js
const packInfo: PackInfo = {
    name: "SAPI-Pro行为包", //行为包名
    version: "0.1", //行为包版本
    author: "不到啊", //作者
    nameSpace: "sapipro", //命名空间
    description: "这是SAPI-Pro包描述", //包描述
};
```

4. 安装依赖
   在项目目录中执行`npm i`即可自动安装@minecraft/server 和@minecraft/server-ui 等依赖
5. 编写代码
   完成配置后，你可以开始在`src/main.ts`中编写代码，通过`import`引入 SAPI-Pro 相关类。使用 tsc 编译为 js 即可以运行。

> **提示**  
> 如果你不使用 TypeScript，可以直接删除 src 和 tsconfig 等文件。并在`scripts/`目录下编写代码。
> 不要删除`import "./SAPI-Pro/main"`及`import "./packInfo";`语句,库需要初始化才能正常使用

### 方式二：现有项目集成

1. 下载：[从 Gitee 下载](https://gitee.com/ykxyx666_admin/SAPI-Pro/releases/latest)|[从 Github 下载](https://github.com/XiaoYangx666/SAPI-Pro/releases/latest)

2. 将库文件解压至项目目录：(JS 版本同理)

    ```bash
    📂 your_project/
    └── 📂 src/
        └── 📂 SAPI-Pro/
            ├── Command/
            ├── Form/
            ├── DataBase.ts
            └── main.ts
    ```

3. 初始化库：

    ```typescript
    // 主入口文件
    import "./SAPI-Pro/main";
    ```

4. 注册包信息

    由于未使用基础包，你需要使用以下代码注册包信息

    ```typescript
    import { LibConfig, PackInfo } from "SAPI-Pro/Config";
    const packInfo: PackInfo = {
        name: "SAPI-Pro 行为包", //行为包名
        version: "0.1", //行为包版本
        author: "不到啊", //作者
        nameSpace: "sapipro", //命名空间
        description: "这是 SAPI-Pro 包描述", //包描述
    };
    // 注册包信息
    LibConfig.regPackInfo(packInfo);
    ```

---

## 核心功能

### 命令系统

命令系统支持内建命令和游戏原生命令两种方式，可以注册"."开头的模拟命令和游戏内/开头的命令。

可以使用 Command 构造函数来创建命令，或使用`Command.fromObject`。在命令较为复杂时，推荐后者。

以下是两个简单的命令注册示例。你还可以创建更为复杂的命令,请阅读[命令注册](_media/command.md)。

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
        system.run(() => {
            player.kill(); //只读模式，需要使用system.run
        });
    },
});
//注册
pcommand.registerCommand(ExampleCmd);
pcommand.registerCommand(killCmd);
//注册游戏命令
pcommand.registerNative(ExampleCmd);
```

#### 性能

实测 10000 条命令解析耗时 1100ms，平均 9 条/ms。1tick 可解析 300+命令，完全够用。

---

### 表单导航

通过 SAPI-Pro，你可以方便的创建表单，并进行表单的导航操作。

以下是一个简单的让用户不断输入的表单的示例，表单还有更多用法，请查阅[表单系统](_media/form.md#%E8%A1%A8%E5%8D%95%E7%B3%BB%E7%BB%9F)。

#### 表单示例

```typescript
//注册表单
const testForm: SAPIProForm<ModalFormData> = {
    builder: (player, args) => {
        const form = new ModalFormData().title("测试表单").textField("1+1=?", "114514");
        args.ans = 2;
        return form;
    },
    handler: (res: ModalFormResponse, ctx) => {
        if (res.formValues) {
            if (parseInt(res.formValues[0] as string) == ctx.args.ans) {
                ctx.player.sendMessage("666答对了");
                return;
            }
        }
        ctx.player.sendMessage("菜，就多练");
        ctx.reopen();
    },
};
//注册打开表单的命令
pcommand.registerCommand(
    new Command("formtest", "表单测试", false, (player) => {
        formManager.open(player, testForm, {}, 10);
    })
);
```

---

### 数据存储

数据存储方面，SAPI-Pro 提供了三个类：`DPDataBase`,`ScoreBoardJSONDataBase`和`ScoreBoardDataBase`。封装了原版的数据存储，使得更方便快捷，并支持超大文本分割存储。存储 10 本小说也没有问题。

#### 动态存储示例

```typescript
import { Configdb } from "SAPI-Pro/DataBase";
//存储数值(还可以存string,Vector3,boolean)
Configdb.set("test", 1);
//存储对象
Configdb.setJSON("info", { author: "XiaoYangx666", version: 0.1 });
//获取存储的数据
const testValue = Configdb.get("test") as number;
const info = Configdb.getJSON("info") as any;
//显示
world.sendMessage(testValue.toString());
world.sendMessage(info.author);
```

> 输出
> 1
> XiaoYangx666

---

### 多包通信

当多个包使用 SAPI-Pro 时，会选举一个主行为包，命令注册由主行为包管理，而命令执行仍由各行为包自己处理，避免冲突。

表单系统支持使用`formManager.openExternal`打开由其它行为包注册的表单。

可以使用 scoreboard 存储在多包中便捷的共享数据。

---

## 示例行为包

[自动整理](https://gitee.com/ykxyx666_admin/sorter-be)

[MCBE 音乐播放器](https://gitee.com/ykxyx666_admin/music-player-mcbe)

[简单假人](https://gitee.com/ykxyx666_admin/simple-sp)

## 参考文档

[SAPI-Pro 参考文档](_media/README-1.md)

## 支持与贡献

欢迎各位大佬莅临修改

问题反馈：<2408807389@qq.com>

GitHub 仓库：[https://github.com/XiaoYangx666/SAPI-Pro](https://github.com/XiaoYangx666/SAPI-Pro)

Gitee 仓库: [gitee.com/ykxyx666_admin/SAPI-Pro](https://gitee.com/ykxyx666_admin/SAPI-Pro)

> 🛠️ 推荐开发环境：
>
> -   VSCode
> -   TypeScript 5.7+
> -   Node.js 20+
