# 初始化

若是新项目，或没有在入口文件初始化，请先初始化sapi-pro

```ts

import { PackInfo, initSAPIPro } from "sapi-pro";
const packInfo: PackInfo = {
    name: "行为包名", //行为包名
    version: "1.0.0", //行为包版本
    author: "作者", //作者
    nameSpace: xxx, //命名空间
    description: "行为包描述", //包描述
    uuid: xxx;//自定义uuid，此字段可为空
};
// 初始化库
initSAPIPro(packInfo);
```

# 模块介绍

## 注意

仅在需要用到相关模块时才阅读对应的文档，禁止阅读未用到功能的文档。

## 命令系统

命令系统可以注册以`.`开头的的聊天模拟命令或`/`开头的游戏原生命令。

- 模拟命令: 支持复杂分支、子命令，但无命令提示(stable版不支持)
- 原生命令：API原生支持，兼容好，不支持复杂分支或子命令

如果要写命令，请参考 [命令系统](./command.md)，如不写命令禁止阅读。

## 表单系统

表单系统支持快捷创建表单，和表单的导航和传值等操作。

表单创建:

- 通过`SAPIProForm`创建基本的sapi-pro表单。
- 通过`commomForm`创建常用表单，`commomForm`都是对`SAPIProForm`的包装。

表单导航和传值:

- ctx.push/ctx.back等完成导航
- ctx.args获取参数

参考: [表单](./form.md)

## 数据存储

SAPI-Pro 提供了几个类：

- `DPDataBase`: 动态数据存储(每个行为包隔离)
- `ScoreBoardJSONDataBase`: 行为包JSON存储(多行为包共享)
- `ScoreBoardDataBase`: mc的Scoreboard的简单封装
- `NameDB`: 专门存储玩家id和名字映射(基于DPDataBase)

这些类封装了原版的数据存储，更方便快捷，支持大文本存储，可存储超长json。

参考: [数据存储](./db.md)

## 多包通信

当多个包使用 SAPI-Pro 时，会选举一个主行为包，命令注册由主行为包管理，而命令执行仍由各行为包自己处理，避免冲突。

表单系统支持使用`formManager.openExternal`打开由其它行为包注册的具名表单。

可使用 scoreboard 存储在多包中便捷的共享数据。

参考: [多包通信](./packcom.md)

## 多语言

支持js实现的多语言，可以在游戏内通过脚本切换，不是mcbe原生多语言。

参考：[多语言](./i18n.md)

## Event

内置常用事件订阅，定时代码优先使用intervalBus

- intervalBus: 订阅周期事件(tick/s/min)
- itemBus: 物品使用订阅
- ScriptEventBus: ScriptEvent订阅
- chatBus: 玩家聊天订阅(stable版本不支持)

```ts
intervalBus.subscribetick(() => {});
itemBus.bind("minecraft:clock", () => {});
```

参考: [Event](./event.md)

## Utils和funcs

Utils: chunkUtils、Vector3Utils、RandomUtils、logger。
funcs: isAdmin、getAllPlayers

参考:[Utils](./utils.md)
