---
name: sapi-pro-dev
description: Required for Minecraft Bedrock Script API projects using sapi-pro. Use when creating, modifying, or debugging sapi-pro projects.
---

# When to use

- 项目依赖sapi-pro
- 创建新的 Minecraft Bedrock Script API 项目
- 修改 sapi-pro 项目代码
- 调试 sapi-pro 项目

# Core Principles

- 优先使用 sapi-pro 提供的封装，而不是直接操作原版 API。
- 优先复用已有功能，不要重新实现命令系统、表单导航、数据存储或国际化。
- 不确定功能是否存在时，先查阅 reference 文档，不要自行实现类似功能。
- 修改、调用sapi-pro相关代码前，必须先查阅项目中实际安装版本的 sapi-pro 类型定义或源码，不要依赖记忆中的API。
- 禁止预读或扫描 reference/examples 目录。仅在确定需要某功能时，才允许根据文档对应路径读取单个 reference 或 example 文件。
- 禁止一次性读取多个 reference 文件，如需额外信息，应在完成当前文档阅读后再按需读取。

# SAPI-Pro 简介

sapi-pro 是一个用于 Minecraft Bedrock Script API (简称：SAPI) 开发的npm框架。包含命令系统、表单导航、数据存储、多包通信与国际化等功能。

# 版本差异

sapi-pro 分为 beta版和stable版。

- beta版：全功能，需要ScriptAPI beta版本
- stable版: 缺失部分功能，需要ScriptAPI稳定版

# SAPI-Pro开发基本步骤

1. 检查项目根目录结构，是否已有文件，是否已安装saip-pro
2. 如果未安装，先安装sapi-pro 参考：reference/installation.md
3. 如果确认已安装 sapi-pro，且使用sapi-kit进行打包(存在依赖或配置文件)，请阅读 sapi-kit/sapi-kit.md 学习用法
4. 确认项目相关环境无误后，可以阅读 reference/modules.md 开始开发，遵循Core Principles

我按 **skill.md 用途** 重写了一版，目标是让 Agent 快速掌握规则，而不是作为开发教程。重点保留：

- 版本约束
- API 查询行为
- 执行权限
- 性能和成就坑

去掉大量解释。

# Minecraft ScriptAPI 开发基础

## ScriptAPI 模块

常用模块：

- `@minecraft/server`：核心 API
- `@minecraft/server-ui`：表单 API
- `@minecraft/server-net`：网络 API（服务器）
- `@minecraft/server-admin`：服务器管理 API（服务器）
- `@minecraft/server-gametest`：测试相关 API

sapi-pro 项目通常使用：

- `@minecraft/server`
- `@minecraft/server-ui`

## ScriptAPI 版本

ScriptAPI 分为 stable 和 beta。

- beta：
    - API 更多
    - 需要开启测试版 API
    - 不支持成就

- stable：
    - API 较少
    - 不需要实验选项
    - 支持成就

规则：

- 所有 `@minecraft/*` 模块必须使用同一版本类型。
- 禁止 beta 和 stable 混用。
- sapi-pro 的 beta/stable 版本与 ScriptAPI 版本对应。

如果出现 npm 依赖冲突，可尝试：

```json
{
    "overrides": {
        "@minecraft/server": "xxx"
    }
}
```

### manifest.json

使用 ScriptAPI 模块时必须声明依赖。

beta：

```json
{
    "module_name": "@minecraft/server",
    "version": "beta"
}
```

stable：

```json
{
    "module_name": "@minecraft/server",
    "version": "2.x.x"
}
```

## API 查询规则

MC API 以项目 `node_modules` 中实际安装的类型定义为准。

禁止：

- 依赖记忆中的 API
- 扫描整个 `.d.ts` 文件
- 无目的浏览 ScriptAPI 类型定义

允许：

- 确认已知 API 的参数、返回值
- 确认某功能是否可以通过 ScriptAPI 实现

查询时：

- 按类名或关键词搜索
- 只读取相关部分

常用搜索：

```
World:
export class World

Entity:
export class Entity

Player:
export class Player extends Entity

Dimension:
export class Dimension

ItemStack:
export class ItemStack

System:
export class System
```

事件：

```
WorldBeforeEvents
WorldAfterEvents
StartupEvent
```

## Script Execution Privilege

ScriptAPI 根据执行环境限制 API。

### Restricted execution

常见：

- `beforeEvents`

限制：

- 不能修改世界状态

需要修改时：

```ts
system.run(() => {
    // 修改操作
});
```

### Early execution

常见：

- `system.beforeEvents.startup`

限制：

- 脚本刚加载时执行
- 大部分世界数据不可访问

不要在此阶段访问：

- 玩家
- 实体
- 区块
- 世界运行时数据

sapi-pro 可使用 `deferred` 延迟初始化依赖运行时的数据。

### Default execution

常见：

- `afterEvents`
- `system.run`

正常执行环境，可使用大部分 API。

## 性能

耗时操作不要阻塞 tick。

长时间任务使用：

```ts
system.runJob(generator);
```

结合：

```ts
function* generator() {}
```

分批执行。

## 成就支持

需要支持成就：

- 使用 stable ScriptAPI
- manifest 添加：

```json
{
    "metadata": {
        "product_type": "addon"
    }
}
```

## 文本符号兼容性

Minecraft 游戏内文本不支持大部分 Emoji（如：✅ ❌ 🤣 🎉等）。

可以使用 Unicode 符号替代，例如：✔ ✘ ㄨ ▪ ⚫ ◤ ▸ ✖ ✕ ✣ 等普通符号。

生成玩家可见文本时，优先使用 Minecraft 支持的符号和颜色代码。

禁止使用 Emoji 作为按钮、提示、标题中的状态图标。

## 颜色字符

基岩版可以使用 § 来进行文本上色
可用范围为：

- 0-9
- a,b,c,d,e,f
- g #DDD605,h #E3D4D1,i #CECACA,j #443A3B,m #971607,n #B4684D,p #DEB12D,q #11A036,s #2CBAA8,t #21497B,u #9A5CC6,v #EB7114,w #8CB3FF
- k(随机),l(粗体),o(斜体),r(重置)

颜色使用:

- 表单按钮背景色为( #C6C6C6)，按钮上的文字应使用深色系
- 表单背景为半透明黑，表单body文字应使用浅色系
- 聊天文本背景、title背景为半透明黑，文字应使用浅色系
