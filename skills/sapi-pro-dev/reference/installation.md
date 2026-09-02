# sapi-pro安装

## 执行顺序

安装前按以下顺序执行：

1. 判断项目使用 Beta API 还是 Stable API
2. 判断是新项目还是已有项目、是否使用 BEPack 构建
3. 选择对应安装方案
4. 安装 sapi-pro
5. 验证安装结果

## 版本判断

安装前必须先确定项目使用的 Minecraft Script API 版本。sapi-pro 的渠道必须与 Script API 渠道一一对应：

- Beta API → sapi-pro beta 版
- Stable API → sapi-pro stable 版

### 根据package.json

优先检查 package.json中的`@minecraft`开头的包如：

```json
{
    "@minecraft/server": "2.10.0-beta.1.26.40-stable"
}
```

规则：

- 若版本字符串包含 -beta或-preview，则项目使用 Beta API。
- 若版本为普通版本号（如 2.8.0），则项目使用 Stable API。

### 根据manifest.json

如果项目不存在 package.json，则检查行为包 manifest.json 中的依赖配置。

根据其中引用的 Minecraft Script API 版本判断使用 Beta API 还是 Stable API（依赖版本为 `"beta"` 即 Beta API）。

禁止在未确认 API 版本时直接安装 sapi-pro。

## 从零开始创建项目

如果用户希望创建一个新的 Minecraft Bedrock Script 项目，优先使用 create-mcbe 的 sapi-pro 模板：

```bash
npm create mcbe@latest <项目名> -- --template sapi-pro --yes --install
```

- 模板默认 stable 渠道。需要 Beta API 时，把 bepack.config.ts 中 `packs.bp.dependencies` 的 `@minecraft/server`、`@minecraft/server-ui`、`sapi-pro` 三个依赖都改为 `"beta"`，再执行 `npx bepack install`。
- sapi-pro 由 BEPack 内置的 `sapiPro()` 插件解析（模板已生成），自动选择与 @minecraft/* 渠道匹配的版本，无需手动 `npm i sapi-pro`。
- BEPack 完整用法见项目内 `node_modules/@bepack/cli/README.zh-CN.md` 与 `reference.md`。

如果用户已有项目但尚未使用 BEPack，可用 `bepack init`（或 `bepack init --from-bp bp/manifest.json` 从已有 manifest 导入）接入。

## 已有项目

### 使用 BEPack

1. 在 bepack.config.ts 的 `packs.bp.dependencies` 中声明 `sapi-pro`（取值 `"stable"`、`"beta"` 或精确版本，如 `"0.4.2-stable"`），并启用 `sapiPro()` 插件：
    ```ts
    import { defineConfig, sapiPro } from "@bepack/cli";
    export default defineConfig({
        plugins: [sapiPro()],
        packs: { bp: { dependencies: { "@minecraft/server": "stable", "@minecraft/server-ui": "stable", "sapi-pro": "stable" } } },
    });
    ```
2. 执行 `npx bepack install` 解析版本并写入 package.json。
3. 注意：`sapi-pro` 渠道必须与 `@minecraft/server`、`@minecraft/server-ui` 渠道一致（stable 对 stable、beta 对 beta），插件会校验并报错。
4. sapi-pro 只打包进 scripts 产物，不写入 manifest.json。

### 其他打包工具

如果项目已经具备打包能力（esbuild、rollup/rolldown、tsup、自定义构建脚本等），直接安装 sapi-pro 的对应渠道：

- Beta API：`npm i sapi-pro@beta`
- Stable API：`npm i sapi-pro@stable`

同时确保 `@minecraft/server`、`@minecraft/server-ui` 与 sapi-pro 渠道一致，并把 sapi-pro 打包进产物（不要作为 manifest 依赖）。

### 无打包工具

1. 告知用户推荐接入 BEPack（`npx @bepack/cli init`，或 `--from-bp bp/manifest.json` 导入）。
2. 获得用户同意后按“使用 BEPack”章节配置。
3. 按“版本判断”章节选择 sapi-pro 渠道。

## 安装后验证

安装完成后检查：

### 依赖检查

确认 package.json 中存在：

- sapi-pro
- @minecraft/server
- @minecraft/server-ui

### 版本检查

确认：

- Beta API 对应 sapi-pro beta 版
- Stable API 对应 sapi-pro stable 版

### 配置检查

如果使用 BEPack：

- bepack.config.ts 存在且 `packs.bp.dependencies` 包含 `sapi-pro`
- `npx bepack config --summary` 能正常输出且 sapi-pro 已解析
- sapi-pro 渠道与 @minecraft/* 渠道一致

### 构建检查

执行一次构建（BEPack 项目为 `bepack build`），确保依赖安装正确。