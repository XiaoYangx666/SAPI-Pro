# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

sapi-pro 是 Minecraft Bedrock ScriptAPI（SAPI）库，提供命令系统、表单导航、数据存储、多包通信、国际化。安装/使用见 README.md，API 文档在 docs/，教程在 tutorial/。Beta 版需要 ScriptAPI beta 模块；stable 版使用稳定 API。开发时加载 `sapi-pro-dev` skill。

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm run build` | 完整构建：clean → typecheck → rolldown 编译 → fflate 打包 zip |
| `npm run typecheck` | `tsc --noEmit`（typescript@7，只做类型检查，不产出） |
| `npm run compile` | `rolldown -c rolldown.config.ts` 编译到 scripts/（含 .d.ts） |
| `npm test` | vitest 全部测试 |
| `npx vitest run test/command/parser.test.ts` | 跑单个测试文件 |
| `npm run pack` | typecheck + compile + `npm pack`，生成发布用 tgz |
| `npm run dev` | rolldown 监听模式 |
| `npm run doc` | typedoc 文档（⚠ 当前不可用，见构建约束） |

构建产物 `scripts/`、`build/`、`*.tgz` 均被 gitignore。测试在 test/ 下，直接从 `../../src/...` 相对导入并用 `vi.mock("@minecraft/server")` 打桩，不走别名。

## 架构

- 入口 `src/main.ts`：`initSAPIPro()` 初始化库并 re-export 各模块。`package.json` 的 `exports` 暴露 10 个子路径：`.`、`./Command`、`./DataBase`、`./Deferred`、`./Form`、`./Translate`、`./Event`、`./func`、`./constants`、`./utils`。
- `src/Config.ts`：`LibConfig` 单例。`version`（数字，多包主机选举权重）+ `versionString`（显示字符串），均由构建时从 package.json 注入。
- `src/System/`：`ScriptCom.ts` 初始化命令注册与多包主机选举（各包 `packComInfo.version` 做数字比较，最大者当主模块）；`sysinfo.ts` 信息命令/表单。
- `src/Command/`：命令系统（`.` 前缀模拟命令 + 原生命令），`parser/` 参数解析。
- `src/Form/`：表单导航，`formManager` 全局管理，支持跨包 `openExternal` 打开别的行为包的表单。
- `src/DataBase/`：`DPDataBase` / `ScoreBoardJSONDataBase` / `ScoreBoardDataBase`，超大文本分割存储。
- `src/Deferred/`：世界加载后才求值的延迟对象，`gameDeferredRegistry` 统一绑定。
- `src/Event.ts`：事件总线（聊天/间隔等）；`src/Translate/`：i18n，`translator`；`src/utils/`：random / vector / chunk / logger / vanilla-data 封装。

## 构建链路约束（改构建相关代码时必看）

- 编译是 **rolldown + rolldown-plugin-dts**，`preserveModules` 逐模块镜像 src → scripts/；tsc 只做 typecheck。
- `rolldown.config.ts` 的 `input` 必须列出 `exports` 的**全部 10 个子路径根文件**。纯 re-export barrel（如 `Deferred/index.ts`）会被 rolldown 提升折叠掉，导致 `sapi-pro/Deferred` 子路径失效。新增公开子路径时，要同步改 `exports` map 并加入 input。
- dts 插件 `entry: ["src/**/*.ts", "!src/global.d.ts"]`：保证所有模块出 `.d.ts`，`global.d.ts` 不进产物。
- **版本注入**：`tools/libVersion.ts` 读 package.json 版本（去预发布后缀），在 `rolldown.config.ts` 的 `transform.define` 和 `vitest.config.ts` 的 `define` 同时注入 `__SAPI_PRO_VERSION__`（显示字符串 major.minor.patch）与 `__SAPI_PRO_VERSION_NUM__`（选举数字 (major×100+minor×10+patch)/100）。`src/global.d.ts` 声明这两个常量。**两个 config 必须同步**，否则 vitest 里引用会 ReferenceError。
- **`@minecraft/*` 在 devDependencies 里钉死精确 beta 版本**（如 `2.9.0-beta.1.26.30-stable`），不要放宽成 `^`——会漂到 rc 版本并破坏 API（如移除 `ChatSendBeforeEvent` 导致 typecheck 挂）。
- `.npmrc` 的 `legacy-peer-deps=true` 是必须的（typescript@7 与 typedoc 的 peer 冲突），删掉则 `npm ci` 报 ERESOLVE。
- **typescript@7 无编译器 API**（`require("typescript")` 只返回 version），`npm run doc`（typedoc）因此不可用；rolldown-plugin-dts 用其实验性 tsgo 生成器兼容 TS7。
- 纯类型 re-export 必须写 `export type { X }`（rolldown 比 tsc 严格，漏了报 MISSING_EXPORT）。
- 发版：改 `package.json` version → `npm run pack` 重新生成 `sapi-pro-<version>.tgz`（下游行为包通过 `file:` 按文件名依赖此 tgz）。

## 开发规则

- 调用/修改 sapi-pro 与 `@minecraft/*` API 时，以 `node_modules` 里实际安装的类型定义为准，不要凭记忆写。
- 游戏内玩家可见文本不要用 Emoji（✅ 🎉 等），用 Unicode 符号（✔ ✘ ▸ 等）；颜色用 `§` 代码。按钮文字用深色系，表单 body/聊天用浅色系。
- 所有 `@minecraft/*` 模块保持同一版本线，禁止 beta/stable 混用。
- 数据存储优先复用 `DataBase` 封装、命令用 `Command` 系统，不要重新实现已有功能。
