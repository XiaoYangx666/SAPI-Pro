# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

sapi-pro 是 Minecraft Bedrock ScriptAPI（SAPI）库，提供命令系统、表单导航、数据存储、多包通信、国际化。安装/使用见 README.md，API 文档在 docs/，教程在 tutorial/。**同一个 npm 包发布双渠道**：`latest` 标签 → stable 版，`beta` 标签 → beta 版；不维护两个分支，用 monorepo 共享源码。开发时加载 `sapi-pro-dev` skill。

## 目录结构

- `packages/core/`：共享源码（`src/`）与共享测试（`test/`），**不发布**。
- `variants/beta/`：beta 渠道构建与发布（使用最新 beta 版 `@minecraft/*`，全功能）。
- `variants/stable/`：stable 渠道构建与发布（使用最新 stable 版 `@minecraft/*`，**无模拟命令、无 chatBus**）。
- `tools/`：版本注入、fflate 打包等构建脚本。
- 根 `package.json` 是编排层（`private: true`），不包含库源码，只做脚本编排与测试依赖。

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm install` | 安装根目录工具链 + 测试用 beta `@minecraft/*` |
| `npm run install:variants` | 分别安装 `variants/beta` 与 `variants/stable` 各自的 `@minecraft/*` 依赖 |
| `npm test` | vitest 全部测试（`packages/core/test`，打桩 `@minecraft/server`） |
| `npm run typecheck` | 双渠道 typecheck（beta + stable，各用各的 `@minecraft/*` 类型） |
| `npm run typecheck:beta` | `tsc -p tsconfig.beta.json --noEmit` |
| `npm run typecheck:stable` | `tsc -p tsconfig.stable.json --noEmit` |
| `npm run compile:beta` | rolldown 编译 beta → `variants/beta/dist/`（含 .d.ts） |
| `npm run compile:stable` | rolldown 编译 stable → `variants/stable/dist/` |
| `npm run dev:beta` / `dev:stable` | rolldown 监听模式 |
| `npm run build` | 完整构建：clean → 双渠道 typecheck → 双渠道 rolldown → fflate 打包 zip |
| `npm run pack` | 完整构建 + `pack:beta` + `pack:stable`，产出 `build/*.zip` 与两个 `.tgz`（CI 用） |
| `npm run build:beta` / `build:stable` | 单渠道 typecheck + 编译 |
| `npm run pack:beta` | `npm pack ./variants/beta` 生成 `sapi-pro-<beta版本>.tgz` |
| `npm run pack:stable` | 生成 `sapi-pro-<stable版本>.tgz` |
| `npm run publish:beta` | `npm publish ./variants/beta --tag beta` |
| `npm run publish:stable` | `npm publish ./variants/stable --tag stable` |

构建产物 `build/`、`variants/*/dist`、`variants/*/node_modules`、`*.tgz` 均被 gitignore。测试在 `packages/core/test/` 下，直接从 `../../src/...` 相对导入并用 `vi.mock("@minecraft/server")` 打桩，不走别名。

## 架构

- 共享实现 `packages/core/src/main.ts`：`initSAPIPro()` 初始化库并 re-export 各模块。每个 variant 的 `package.json` 的 `exports` 暴露 10 个子路径：`.`、`./Command`、`./DataBase`、`./Deferred`、`./Form`、`./Translate`、`./Event`、`./func`、`./constants`、`./utils`，指向各自 `dist/`。其中 `.` 与 `./Event` 指向**每渠道入口 barrel**（`entry.beta.ts` / `entry.stable.ts`、`Event.entry.beta.ts` / `Event.entry.stable.ts`），其余指向共享模块根文件。
- `packages/core/src/Config.ts`：`LibConfig` 单例。`version`（数字，多包主机选举权重）+ `versionString`（显示字符串），均由构建时从**各自 variant 的 package.json** 注入；`isBeta = __BETA__`（构建期常量）。
- `packages/core/src/System/`：`ScriptCom.ts` 初始化命令注册与多包主机选举（各包 `packComInfo.version` 做数字比较，最大者当主模块；**stable 版不参与选举**）；`sysinfo.ts` 信息命令/表单。
- `packages/core/src/Command/`：命令系统。**`.` 前缀模拟命令（`Command/parser/parser.ts`）、自定义 help（`Command/help.ts`，专门为 `.help` 准备的）与 chatBus 仅 beta 渠道存在**；stable 渠道这三个模块不进产物、`CommandManager.parser` 与 `help` 均为 `undefined`（通过 `SimulatedParserLike` / `HelpLike` 结构接口解耦）。**stable 只允许 `registerNative` 注册游戏原生命令**（customCommandRegistry + `NativeCommandParser`），`registerCommand`（模拟命令）在 stable 无效、不自动转原生，自定义 help 由游戏自带 `/help` 覆盖。
- `packages/core/src/Form/`：表单导航，`formManager` 全局管理，支持跨包 `openExternal` 打开别的行为包的表单。
- `packages/core/src/DataBase/`：`DPDataBase` / `ScoreBoardJSONDataBase` / `ScoreBoardDataBase`，超大文本分割存储。
- `packages/core/src/Deferred/`：世界加载后才求值的延迟对象，`gameDeferredRegistry` 统一绑定。
- `packages/core/src/Event.ts`：事件总线（聊天/间隔等）；`Translate/`：i18n，`translator`；`utils/`：random / vector / chunk / logger / vanilla-data 封装。

## 双渠道构建（改构建相关代码时必看）

- 两个 variant 各自有 `rolldown.config.ts` + `tsconfig.json` + `package.json`，**同一份 `packages/core/src` 构建成不同 dist**。编译是 **rolldown + rolldown-plugin-dts**，`preserveModules` 逐模块镜像 `packages/core/src` → `variants/<ch>/dist`；tsc 只做 typecheck。
- 每个 variant 的 rolldown `input` 必须列出 `exports` 的**全部 10 个子路径根文件**。其中 `.` 与 `./Event` 是本渠道入口 barrel（`entry.<ch>.ts`、`Event.entry.<ch>.ts`），其余 8 个是共享模块根文件（如 `Event.ts`、`Command/main.ts`）。纯 re-export barrel（如 `Deferred/index.ts`）会被 rolldown 提升折叠掉，导致子路径失效。新增公开子路径时，要同步改两个 variant 的 `exports` map、`rolldown.config.ts` 的 input。
- **dts 插件 `entry` 必须用相对 `process.cwd()` 的 glob**（`${CORE_REL}/**/*.ts`）。插件按 `path.relative(cwd, id)` 匹配，绝对路径 glob 会一个 `.d.ts` 都出不来。
- **同一份源码对不同版本类型检查**：每渠道一个 tsconfig 在**仓库根**（`tsconfig.beta.json` / `tsconfig.stable.json`），用 `paths` 把 `@minecraft/server`、`@minecraft/server-ui` 重定向到各自 `node_modules` 里的类型。**TS7 已移除 `baseUrl`**，`paths` 相对各自 tsconfig 所在目录解析。
- **dts 输出路径必须与 .js 对齐**：rolldown dts 插件以 `dirname(tsconfig)` 为 rootDir（即仓库根）。全部源码都在 `packages/core/src`（**没有渠道源码**），因此 `output.preserveModulesRoot = CORE`，同时 dts 插件显式传 `compilerOptions.rootDir = CORE`——两者一致，dist 干净镜像成 `dist/main.js`、`dist/Event.js`、`dist/entry.beta.js` 等。曾把渠道源码（chatBus/commandWiring）放 `variants/` 目录，导致 preserveModulesRoot 必须为仓库根、dist 带 `packages/core/src/` 与 `variants/<ch>/` 前缀，且依赖 `@sapi/*` 别名，已废弃。
- **构建期条件编译**：`__BETA__` 在 beta 的 rolldown 里注入 `true`、stable 注入 `false`，实现 dead code elimination。stable 因此没有模拟命令的聊天接线（`Command/main.ts` 里 `if (__BETA__)` 整段消除），且 `Event/chatBus.ts` 经 `treeshake.moduleSideEffects` 声明为无副作用后整个模块不进产物。
- **chatBus 按入口隔离（唯一渠道差异点，stable 不导出）**：聊天相关类型与 `chatBusClass` 在共享的 `Event/chatBusClass.ts`（stable 也在用，`ChatSendBeforeEventLike` 结构类型兜底），**chatBus 实例**在共享的 `Event/chatBus.ts`（`export const chatBus = new chatBusClass()`）。`Event.ts` 只 re-export `chatBusClass`，不导出实例。**每渠道入口 barrel 决定是否暴露实例**：`entry.beta.ts` / `Event.entry.beta.ts` = 共享入口 + `export * from "./Event/chatBus"`；`entry.stable.ts` / `Event.entry.stable.ts` 不含 chatBus → stable 的 `.` 与 `./Event` 的 d.ts 都没有 chatBus，消费方 `import { chatBus }` 报 TS2305，beta 免空检查。运行时接线在共享 `Command/main.ts`：`if (__BETA__) chatBus.subscribe(pcommand.runCommand.bind(pcommand))`。**stable 产物不含 `Event/chatBus.js`/`.d.ts`**：靠 stable 的 `treeshake.moduleSideEffects`（`Event/chatBus.ts` 无副作用）+ dts entry glob 排除。曾尝试 `typeof __BETA__` 条件类型、独立类型文件 + tsconfig paths、per-channel 源码 + `@sapi/*` 别名等方案，均因 dts 插件局限或过度复杂失败/废弃。
- **`ChatSendBeforeEvent` 仅 beta 有**（stable `@minecraft/server@2.8.0` 已移除）。共享源码里用结构类型 `ChatSendBeforeEventLike`（`Event.ts` 导出）替代，`world.beforeEvents.chatSend` 用断言访问，保证 stable 类型下也能通过。新增代码不要直接 import `ChatSendBeforeEvent`。
- **stable 剔除模拟命令子系统**：`CommandManager`/`CommandHelp` 通过结构接口 `SimulatedParserLike`、`HelpLike`（定义在 `Command/manager.ts`）解耦，不直接引用 `CommandParser`/`CommandHelp` 类型；`Command/main.ts` 里 `const parser = __BETA__ ? new CommandParser() : undefined`、`const help = __BETA__ ? new CommandHelp(...) : undefined`。stable 的 rolldown 配置额外用 `treeshake.moduleSideEffects` 把 `Command/parser/parser.ts`、`Command/parser/func.ts`、`Command/help.ts` 声明为**无副作用**（`main.ts` 对它们的 import 在 `__BETA__=false` 下成为未使用 import，整体丢弃），并在 dts entry glob 里排除这三个文件；因此 **stable 产物完全没有 `parser.js`、`parser/func.js`、`help.js` 及对应 `.d.ts`**。beta 配置不做这些，全量保留。新增模拟命令相关代码注意别让 stable 重新引用这三个模块。
- **版本注入**：`tools/libVersion.ts` 的 `getLibVersion(packageJsonPath)` 读**指定 variant 的 package.json** 版本（去预发布后缀），在各自 `rolldown.config.ts` 的 `transform.define` 注入 `__SAPI_PRO_VERSION__`（显示字符串 major.minor.patch）与 `__SAPI_PRO_VERSION_NUM__`（选举数字 (major×100+minor×10+patch)/100）。`vitest.config.ts` 的 `define` 与 **beta** variant 保持一致。`packages/core/src/global.d.ts` 声明这三个常量。
- **`@minecraft/*` 版本钉死精确值，不要放宽成 `^`**：beta 用 `2.10.0-beta.1.26.40-stable` / `2.2.0-beta.1.26.40-stable`，stable 用 `2.8.0` / `2.1.0`（以 npm `dist-tags` 为准）。会漂到 rc 版本并破坏 API。
- **每渠道类型单独安装**：`variants/beta` 与 `variants/stable` 各自的 `devDependencies` 钉各自的 `@minecraft/*`，需 `npm run install:variants`（两个目录各有 package-lock.json）。**根目录不安装 `@minecraft/*`**：构建链路各自用 `tsconfig.beta/stable.json` 的 paths 重定向到渠道 node_modules；编辑器/测试类型经根 `tsconfig.json` 的 paths 指向 `variants/beta` 安装的 beta 类型（vitest 用工厂 mock 不加载真实模块）。三者不得混用。
- `.npmrc` 的 `legacy-peer-deps=true` 是必须的（typescript@7 与 typedoc 的 peer 冲突），删掉则 `npm ci` 报 ERESOLVE。
- **typescript@7 无编译器 API**（`require("typescript")` 只返回 version）；rolldown-plugin-dts 用其实验性 tsgo 生成器兼容 TS7。
- 纯类型 re-export 必须写 `export type { X }`（rolldown 比 tsc 严格，漏了报 MISSING_EXPORT）。

## 发版

- **版本规则**：两渠道共享同一 base 版本，beta 不带后缀、stable 带 `-stable` 后缀。如 base `0.4.2`：beta 版 `0.4.2`，stable 版 `0.4.2-stable`。`libVersionString` 两边都解析为 `0.4.2`，游戏内显示 `0.4.2-beta` / `0.4.2-stable`。
- beta 渠道：改 `variants/beta/package.json` 的 `version`（如 `0.4.2`）→ `npm run pack:beta` → `npm run publish:beta`（`--tag beta`）。
- stable 渠道：改 `variants/stable/package.json` 的 `version`（如 `0.4.2-stable`）→ `npm run pack:stable` → `npm run publish:stable`（`--tag stable`）。**两渠道都不挂 `latest` 标签**，安装时用 `sapi-pro@beta` / `sapi-pro@stable` 显式指定。
- 下游行为包通过 `file:` 按文件名依赖 `sapi-pro-<version>.tgz`，版本不同文件名不同，直接换引用即可。

## 开发规则

- 调用/修改 sapi-pro 与 `@minecraft/*` API 时，以各渠道 `node_modules` 里实际安装的类型定义为准，不要凭记忆写。
- 游戏内玩家可见文本不要用 Emoji（✅ 🎉 等），用 Unicode 符号（✔ ✘ ▸ 等）；颜色用 `§` 代码。按钮文字用深色系，表单 body/聊天用浅色系。
- 新增功能若依赖 beta-only API（如 chatSend before 事件），必须用 `__BETA__` 或结构类型隔离，保证 stable 渠道 typecheck 通过；stable 不提供该功能。
- 数据存储优先复用 `DataBase` 封装、命令用 `Command` 系统，不要重新实现已有功能。
