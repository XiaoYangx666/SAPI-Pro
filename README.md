# SAPI-Pro

![Requires](https://img.shields.io/badge/依赖-SAPI%202.2.0%20Beta-red) ![Support](https://img.shields.io/badge/支持版本-MCBE1.21.100-green)

[简体中文](README.md)|[English](README_EN.md)

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

### 方式一：使用 sapi-kit 创建（推荐）

如果你想基于 SAPI-Pro 创建新的脚本行为包，你可以使用 sapi-kit。sapi-kit 提供了模板包，并支持编译，第三方库打包，更新版本等功能，方便开发。

1. 安装 sapi-kit

    ```bash
    npm i -g sapi-kit
    ```

2. 进入项目目录，初始化项目

    ```bash
    sapi-kit init
    ```

3. 安装 SAPI-Pro
    ```bash
    npm i sapi-pro
    ```
4. 在 src/main.ts 中初始化库

```typescript
//src/main.ts
import { PackInfo, initSAPIPro } from "sapi-pro";
const packInfo: PackInfo = {
    name: "行为包名", //行为包名
    version: "1.0.0", //行为包版本
    author: "作者", //作者
    nameSpace: "sapipro", //命名空间
    description: "行为包描述", //包描述
};
// 初始化库
initSAPIPro(packInfo);
```

有关 sapi-kit 的更多信息:[ScriptApi-Kit](https://gitee.com/ykxyx666_admin/script-api-kit)

> **提示**  
> 如果你不使用 TypeScript，可以直接在 src 中编写 js 代码。
> 库必须初始化才能正常使用

### 方式二：现有项目手动集成

1.  下载：[从 Gitee 下载](https://gitee.com/ykxyx666_admin/SAPI-Pro/releases/latest)|[从 Github 下载](https://github.com/XiaoYangx666/SAPI-Pro/releases/latest)

2.  将库文件解压至项目目录：(JS 版本同理)

    ```bash
    📂 your_project/
    └── 📂 src/
        └── 📂 SAPI-Pro/
            ├── Command/
            ├── Form/
            ├── DataBase.ts
            └── main.ts
    ```

3.  初始化库：

    ```typescript
    //src/main.ts
    import { PackInfo, initSAPIPro } from "sapi-pro";
    const packInfo: PackInfo = {
        name: "行为包名", //行为包名
        version: "1.0.0", //行为包版本
        author: "作者", //作者
        nameSpace: "sapipro", //命名空间
        description: "行为包描述", //包描述
    };
    // 初始化库
    initSAPIPro(packInfo);
    ```

---

## 核心功能

### 命令系统

命令系统支持内建命令和游戏原生命令两种方式，可以注册"."开头的模拟命令和游戏内/开头的命令。

可以使用 Command 构造函数来创建命令，或使用`Command.fromObject`。在命令较为复杂时，推荐后者。

以下是两个简单的命令注册示例。你还可以创建更为复杂的命令,请阅读[命令注册](./tutorial/command.md)。

#### 命令示例

```typescript
import { Player, system } from "@minecraft/server";
import { Command, pcommand } from "sapi-pro";

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

以下是一个简单的让用户不断输入的表单的示例，表单还有更多用法，请查阅[表单系统](./tutorial/form.md#表单系统)。

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
import { Configdb } from "sapi-pro";
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

[SAPI-Pro 参考文档](./tutorial/README.md)

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
