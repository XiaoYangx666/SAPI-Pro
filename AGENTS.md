# AGENTS.md

This file provides guidance to AI coding agents (Claude Code、Codex、Cursor 等) when working with code in this repository.

## 项目简介

sapi-pro 是 Minecraft Bedrock ScriptAPI（SAPI）库，提供命令系统、表单导航、数据存储、多包通信、国际化。安装/使用见 README.md，API 文档在 docs/，教程在 tutorial/。**同一个 npm 包发布双渠道**：`latest` 标签 → beta 版，`stable` 标签 → stable 版；Release workflow 同时让 `beta` 标签指向当前 beta 版本。不维护两个分支，用 monorepo 共享源码。开发时加载 `sapi-pro-dev` skill。

## 目录结构

- `core/`：共享源码（`src/`）与共享测试（`test/`），**不发布**（无独立 package.json，非 npm 包，直接由两个 variant 构建）。
- `variants/beta/`：beta 渠道构建与发布（使用最新 beta 版 `@minecraft/*`，全功能）。
- `variants/stable/`：stable 渠道构建与发布（使用最新 stable 版 `@minecraft/*`，**无模拟命令、无 chatBus**）。
- `tools/`：构建脚本（仅 `libVersion.ts`，负责版本注入）。
- `skills/sapi-pro-dev/`：给 AI 助手用的 skill 源文件（不随 npm 包发布，也没有安装脚本，需要时手动拷到助手的 skill 目录）。
- `docs/`：历史 typedoc 产物（139 个文件），**生成依赖已移除，现为手动维护**。
- 根 `package.json` 是编排层（`private: true`），不包含库源码，只做脚本编排与测试依赖。

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm install` | 安装根目录工具链（根目录不安装 `@minecraft/*`） |
| `npm run install:variants` | 分别安装 `variants/beta` 与 `variants/stable` 各自的 `@minecraft/*` 依赖 |
| `npm test` | vitest 全部测试（`core/test`，打桩 `@minecraft/server`） |
| `npm run typecheck` | 双渠道 typecheck（beta + stable，各用各的 `@minecraft/*` 类型） |
| `npm run typecheck:beta` | `tsc -p tsconfig.beta.json --noEmit` |
| `npm run typecheck:stable` | `tsc -p tsconfig.stable.json --noEmit` |
| `npm run compile:beta` | rolldown 编译 beta → `variants/beta/dist/`（含 .d.ts） |
| `npm run compile:stable` | rolldown 编译 stable → `variants/stable/dist/` |
| `npm run dev:beta` / `dev:stable` | rolldown 监听模式 |
| `npm run build` | 完整构建：clean → 双渠道 typecheck → 双渠道 rolldown（产出各自 `dist/`，含 .d.ts） |
| `npm run pack` | 完整构建 + `pack:beta` + `pack:stable`，产出两个 `.tgz`（CI 用） |
| `npm run build:beta` / `build:stable` | 单渠道 typecheck + 编译 |
| `npm run pack:beta` | `npm pack ./variants/beta` 生成 `sapi-pro-<beta版本>.tgz` |
| `npm run pack:stable` | 生成 `sapi-pro-<stable版本>.tgz` |
| `npm run publish:beta` | `npm publish ./variants/beta --tag latest` |
| `npm run publish:stable` | `npm publish ./variants/stable --tag stable` |

构建产物 `variants/*/dist`、`variants/*/node_modules`、`*.tgz` 均被 gitignore。测试在 `core/test/` 下，源码用 `../../src/...` 相对导入（少数 `vi.mock` 用 `@/` alias，由 `vitest.config.ts` 提供），并用 `vi.mock("@minecraft/server")` 打桩。**库不再产出 zip**：分发只有 npm 包（`.tgz`）一条路径。

## 架构

- 共享实现 `core/src/main.ts`：`initSAPIPro()` 初始化库并 re-export 各模块。每个 variant 的 `package.json` 的 `exports` 暴露 10 个子路径：`.`、`./Command`、`./DataBase`、`./Deferred`、`./Form`、`./Translate`、`./Event`、`./func`、`./constants`、`./utils`，指向各自 `dist/`。其中 `.` 与 `./Event` 指向**每渠道入口 barrel**（`entry.beta.ts` / `entry.stable.ts`、`Event.entry.beta.ts` / `Event.entry.stable.ts`），其余指向共享模块根文件。
- `core/src/Config.ts`：`LibConfig` 单例。`version`（数字，多包主机选举权重）+ `versionString`（显示字符串），均由构建时从**各自 variant 的 package.json** 注入；`isBeta = __BETA__`（构建期常量）。
- `core/src/System/`：`ScriptCom.ts` 初始化命令注册与多包主机选举（各包 `packComInfo.version` 做数字比较，最大者当主模块；**stable 版不参与选举**）；`sysinfo.ts` 信息命令/表单。
- `core/src/Command/`：命令系统。**`.` 前缀模拟命令（`Command/parser/parser.ts`）、自定义 help（`Command/help.ts`，专门为 `.help` 准备的）与 chatBus 仅 beta 渠道存在**；stable 渠道这三个模块不进产物、`CommandManager.parser` 与 `help` 均为 `undefined`（通过 `SimulatedParserLike` / `HelpLike` 结构接口解耦）。**stable 只允许 `registerNative` 注册游戏原生命令**（customCommandRegistry + `NativeCommandParser`），`registerCommand`（模拟命令）在 stable 无效、不自动转原生，自定义 help 由游戏自带 `/help` 覆盖。
- **原生命令的 enum 参数按渠道分支（实机踩了三轮才对齐）**：两条运行时规则 —— ①枚举名**必须带命名空间**，否则 `registerEnum` 抛 `NamespaceNameError`；②stable `@minecraft/server`（2.10.0）的 `CustomCommandParameter` **没有 `enumName`**，运行时把**参数名逐字**当枚举名查表，所以 stable 下 enum/flag 参数的 `name` 必须写成 `命名空间:参数名`，枚举也用同一个名字注册（参数名不参与命令语法与参数解析，`NativeCommandParser` 是按位置映射的，所以无副作用）。beta 有 `enumName`（`@beta`），参数名保持短名、用唯一枚举名解耦，避免同包内不同命令的同名参数互相覆盖。逻辑在 `core/src/Command/enumName.ts`（`nativeEnumName` / `nativeEnumParamName`），回归测试 `core/test/command/enumName.test.ts`。另外 `CommandManager.registerNativeCommands` 对每条命令单独 try/catch（一条注册失败不再中断后续命令）；枚举注册走 `core/src/Command/enumRegistry.ts` 的 `planEnumRegistrations()`：同名同值复用、**同名不同值自动改名成 `命名空间:命令名_参数名` 并同步改写参数引用**（stable 下参数名就是枚举名，不改名两条命令无法共存），测试见 `core/test/command/enumRegistry.test.ts`。
- `core/src/Form/`：表单导航，`formManager` 全局管理，支持跨包 `openExternal` 打开别的行为包的表单。
- `core/src/DataBase/`：`DPDataBase` / `ScoreBoardJSONDataBase` / `ScoreBoardDataBase`，超大文本分割存储。
- `core/src/Deferred/`：世界加载后才求值的延迟对象，`gameDeferredRegistry` 统一绑定。
- `core/src/Event.ts`：事件总线（聊天/间隔等）；`Translate/`：i18n，`translator`；`utils/`：random / vector / chunk / logger，以及 `vanila-data.ts`（仅一个 `DimensionIds` 枚举）。
- **事件总线按需订阅（只做"没用过就不订阅"，别加退订/停表逻辑）**：`intervalBus` 首个 tick/sec/min 订阅者到来才 `system.runInterval`（启动后不再停）；定时器本身仍等 worldLoad（回调会碰世界数据）。`itemBase` 首次 `bind` 才订阅 `itemUse`。`formManager` 不再在 `_bind()` 里常驻订阅 min 清理，改为 `_showDelay`（所有展示路径的必经点）时订阅一次。这样没用周期事件/没用物品/没开过表单的包完全不建这些监听；**用过之后不做清理是刻意的**，不要补回退订。测试见 `core/test/event/lazyBind.test.ts`。
- **事件订阅留在脚本根上下文，不要挪进 `worldLoad`**：早执行阶段允许 `world.beforeEvents/afterEvents.*.subscribe`、`system.*Events.*.subscribe`、`system.run/runInterval/clearRun`（[官方权限说明](https://learn.microsoft.com/en-us/minecraft/creator/documents/scripting/execution-privilege)、[Bedrock Wiki](https://wiki.bedrock.dev/scripting/privileges#early-execution-apis)）；把订阅推进 worldLoad 反而可能"some events not being triggered"。同理，以下三处**有意保持常驻**，不要顺手优化：`ScriptEventBus`（跨包 `form:open` 需要被动接收）、beta 的 `chatBus`（`Command/main.ts` 在根上下文接线，且主机包的命令要等 `initCom` 才导入）、`Command/manager.ts` 的 `system.beforeEvents.startup`（原生命令注册必须早执行订阅）。

## 双渠道构建（改构建相关代码时必看）

- 两个 variant 各自有 `rolldown.config.ts` + `package.json`（**渠道 tsconfig 不在 variant 里，而在仓库根**：`tsconfig.beta.json` / `tsconfig.stable.json`），**同一份 `core/src` 构建成不同 dist**。编译是 **rolldown + rolldown-plugin-dts**，`preserveModules` 逐模块镜像 `core/src` → `variants/<ch>/dist`；tsc 只做 typecheck。
- 每个 variant 的 rolldown `input` 必须列出 `exports` 的**全部 10 个子路径根文件**。其中 `.` 与 `./Event` 是本渠道入口 barrel（`entry.<ch>.ts`、`Event.entry.<ch>.ts`），其余 8 个是共享模块根文件（如 `Event.ts`、`Command/main.ts`）。纯 re-export barrel（如 `Deferred/index.ts`）会被 rolldown 提升折叠掉，导致子路径失效。新增公开子路径时，要同步改两个 variant 的 `exports` map、`rolldown.config.ts` 的 input。
- **dts 插件 `entry` 必须用相对 `process.cwd()` 的 glob**（`${CORE_REL}/**/*.ts`）。插件按 `path.relative(cwd, id)` 匹配，绝对路径 glob 会一个 `.d.ts` 都出不来。
- **同一份源码对不同版本类型检查**：每渠道一个 tsconfig 在**仓库根**（`tsconfig.beta.json` / `tsconfig.stable.json`），用 `paths` 把 `@minecraft/server`、`@minecraft/server-ui` 重定向到各自 `node_modules` 里的类型。**TS7 已移除 `baseUrl`**，`paths` 相对各自 tsconfig 所在目录解析。
- **dts 输出路径必须与 .js 对齐**：rolldown dts 插件以 `dirname(tsconfig)` 为 rootDir（即仓库根）。全部源码都在 `core/src`（**没有渠道源码**），因此 `output.preserveModulesRoot = CORE`，同时 dts 插件显式传 `compilerOptions.rootDir = CORE`——两者一致，dist 干净镜像成 `dist/main.js`、`dist/Event.js`、`dist/entry.beta.js` 等。曾把渠道源码（chatBus/commandWiring）放 `variants/` 目录，导致 preserveModulesRoot 必须为仓库根、dist 带 `core/src/` 与 `variants/<ch>/` 前缀，且依赖 `@sapi/*` 别名，已废弃。
- **构建期条件编译**：`__BETA__` 在 beta 的 rolldown 里注入 `true`、stable 注入 `false`，实现 dead code elimination。stable 因此没有模拟命令的聊天接线（`Command/main.ts` 里 `if (__BETA__)` 整段消除），且 `Event/chatBus.ts` 经 `treeshake.moduleSideEffects` 声明为无副作用后整个模块不进产物。
- **chatBus 按入口隔离（唯一渠道差异点，stable 不导出）**：聊天相关类型与 `chatBusClass` 在共享的 `Event/chatBusClass.ts`（stable 也在用，`ChatSendBeforeEventLike` 结构类型兜底），**chatBus 实例**在共享的 `Event/chatBus.ts`（`export const chatBus = new chatBusClass()`）。`Event.ts` 只 re-export `chatBusClass`，不导出实例。**每渠道入口 barrel 决定是否暴露实例**：`entry.beta.ts` / `Event.entry.beta.ts` = 共享入口 + `export * from "./Event/chatBus"`；`entry.stable.ts` / `Event.entry.stable.ts` 不含 chatBus → stable 的 `.` 与 `./Event` 的 d.ts 都没有 chatBus，消费方 `import { chatBus }` 报 TS2305，beta 免空检查。运行时接线在共享 `Command/main.ts`：`if (__BETA__) chatBus.subscribe(pcommand.runCommand.bind(pcommand))`。**stable 产物不含 `Event/chatBus.js`/`.d.ts`**：靠 stable 的 `treeshake.moduleSideEffects`（`Event/chatBus.ts` 无副作用）+ dts entry glob 排除。曾尝试 `typeof __BETA__` 条件类型、独立类型文件 + tsconfig paths、per-channel 源码 + `@sapi/*` 别名等方案，均因 dts 插件局限或过度复杂失败/废弃。
- **`ChatSendBeforeEvent` 仅 beta 有**（stable 渠道从 `@minecraft/server@2.8.0` 起移除，当前 `2.10.0` 仍无该类型与 `beforeEvents.chatSend`）。共享源码里用结构类型 `ChatSendBeforeEventLike`（`Event.ts` 导出）替代，`world.beforeEvents.chatSend` 用断言访问，保证 stable 类型下也能通过。新增代码不要直接 import `ChatSendBeforeEvent`。
- **stable 剔除模拟命令子系统**：`CommandManager`/`CommandHelp` 通过结构接口 `SimulatedParserLike`、`HelpLike`（定义在 `Command/manager.ts`）解耦，不直接引用 `CommandParser`/`CommandHelp` 类型；`Command/main.ts` 里 `const parser = __BETA__ ? new CommandParser() : undefined`、`const help = __BETA__ ? new CommandHelp(...) : undefined`。stable 的 rolldown 配置额外用 `treeshake.moduleSideEffects` 把 `Command/parser/parser.ts`、`Command/parser/func.ts`、`Command/help.ts` 声明为**无副作用**（`main.ts` 对它们的 import 在 `__BETA__=false` 下成为未使用 import，整体丢弃），并在 dts entry glob 里排除这三个文件；因此 **stable 产物完全没有 `parser.js`、`parser/func.js`、`help.js` 及对应 `.d.ts`**。beta 配置不做这些，全量保留。新增模拟命令相关代码注意别让 stable 重新引用这三个模块。
- **版本注入**：`tools/libVersion.ts` 的 `getLibVersion(packageJsonPath)` 读**指定 variant 的 package.json** 版本（去预发布后缀），在各自 `rolldown.config.ts` 的 `transform.define` 注入 `__SAPI_PRO_VERSION__`（显示字符串 major.minor.patch）与 `__SAPI_PRO_VERSION_NUM__`（选举数字 (major×100+minor×10+patch)/100）。`vitest.config.ts` 的 `define` 与 **beta** variant 保持一致。`core/src/global.d.ts` 声明这三个常量。
- **`@minecraft/*` 版本钉死精确值，不要放宽成 `^`**：beta 用 `2.11.0-beta.1.26.50-stable` / `2.3.0-beta.1.26.50-stable`，stable 用 `2.10.0` / `2.2.0`（以 npm `dist-tags` 为准，`latest` → stable、`beta` → beta）。会漂到 rc 版本并破坏 API。
- **variant 的 `peerDependencies` 除本渠道 `@minecraft/*` 外，还显式声明 `@minecraft/vanilla-data: ">=1.26.0"`**：用于给下游行为包划定 vanilla-data 版本下限。源码本身不 import 它（`utils/vanila-data.ts` 只是自带枚举），`@minecraft/server` 也自带同类 peer（`>=1.20.70`）。
- **每渠道类型单独安装**：`variants/beta` 与 `variants/stable` 各自的 `devDependencies` 钉各自的 `@minecraft/*`，需 `npm run install:variants`（两个目录各有 package-lock.json）。**根目录不安装 `@minecraft/*`**：构建链路各自用 `tsconfig.beta/stable.json` 的 paths 重定向到渠道 node_modules；编辑器/测试类型经根 `tsconfig.json` 的 paths 指向 `variants/beta` 安装的 beta 类型（vitest 用工厂 mock 不加载真实模块）。三者不得混用。
- `.npmrc` 的 `omit-lockfile-registry-resolved=true` 让 lock 不写入 `resolved` 里的 registry 地址（否则本地镜像源地址会被带进 CI 的 lock）。
- **typescript@7 无编译器 API**（`require("typescript")` 只返回 version）；rolldown-plugin-dts 用其实验性 tsgo 生成器兼容 TS7。
- 纯类型 re-export 必须写 `export type { X }`（rolldown 比 tsc 严格，漏了报 MISSING_EXPORT）。

## 发版

- **版本规则**：两渠道共享同一 base 版本，beta 不带后缀、stable 带 `-stable` 后缀。如 base `0.4.2`：beta 版 `0.4.2`，stable 版 `0.4.2-stable`。`libVersionString` 两边都解析为 `0.4.2`，游戏内显示 `0.4.2-beta` / `0.4.2-stable`。
- 改版本时必须同步对应 variant 的 `package.json` 与 `package-lock.json` 顶层/根包版本，避免发布元数据残留旧版本。
- beta 渠道：改 `variants/beta/package.json` 的 `version`（如 `0.4.2`）→ `npm run pack:beta` → `npm run publish:beta`（`--tag latest`）。Release workflow 发布后再把 npm 的 `beta` dist-tag 同步指向同一版本，因此 `sapi-pro` 与 `sapi-pro@beta` 都是当前 beta。
- stable 渠道：改 `variants/stable/package.json` 的 `version`（如 `0.4.2-stable`）→ `npm run pack:stable` → `npm run publish:stable`（`--tag stable`）。默认 `npm i sapi-pro` 安装 beta；stable 必须显式使用 `sapi-pro@stable`。
- 两个 variant 的 `publishConfig.tag` 分别固定为 `latest` / `stable`，防止直接在 variant 目录执行 `npm publish` 时占错 dist-tag。
- 下游行为包通过 `file:` 按文件名依赖 `sapi-pro-<version>.tgz`，版本不同文件名不同，直接换引用即可。

## 实机自检（改动影响运行时行为时必看）

两个自检工程在仓库外，用 `file:` 依赖本仓库打出的 tgz；`npm run build` = `bepack build --copy`，成品自动复制到
`%USERPROFILE%\AppData\Roaming\Minecraft Bedrock\Users\Shared\games\com.mojang\development_behavior_packs\`：

| 工程 | 渠道（依赖） | 命名空间 | 世界要求 |
|---|---|---|---|
| `E:\MCDev\sapi-pro-tests` | stable（`sapi-pro-0.4.2-stable.tgz`） | `sapitest` | 普通世界 |
| `E:\MCDev\sapi-beta-test` | beta（`sapi-pro-0.4.2.tgz`） | `sapibeta` | 需开 Beta APIs |

流程：本仓库 `npm run pack` → 测试工程里 **`npm uninstall sapi-pro` 再 `npm install ../SAPI-Pro/sapi-pro-0.4.x[-stable].tgz`** → `npm run build` → 进游戏看聊天栏自检清单。

- **同名同版本的 `file:` tgz 内容变了时，只跑 `npm install`（连 `--force`）不会更新**：npm 复用上次解包结果，必须卸载后重装。
- 游戏内**必须开作弊**，否则原生命令的枚举取值不会出现在命令提示里（容易被误判成"枚举没生效"）。
- 覆盖：事件总线按需订阅（worldLoad 之后才订阅/绑定）、表单与 min 清理、原生命令 enum/flag/可选参数、同名枚举自动改名、beta 的 chatBus 与模拟命令。
- 加新功能时同步补一条自检命令，并更新各自工程的 `TESTING.md`（含判定标准与"什么才算失败"）。
- 两个自检工程**不是 git 仓库**，改动只落在磁盘上。

## 开发规则

- 调用/修改 sapi-pro 与 `@minecraft/*` API 时，以各渠道 `node_modules` 里实际安装的类型定义为准，不要凭记忆写。
- 游戏内玩家可见文本不要用 Emoji（✅ 🎉 等），用 Unicode 符号（✔ ✘ ▸ 等）；颜色用 `§` 代码。按钮文字用深色系，表单 body/聊天用浅色系。
- 新增功能若依赖 beta-only API（如 chatSend before 事件），必须用 `__BETA__` 或结构类型隔离，保证 stable 渠道 typecheck 通过；stable 不提供该功能。
- 数据存储优先复用 `DataBase` 封装、命令用 `Command` 系统，不要重新实现已有功能。