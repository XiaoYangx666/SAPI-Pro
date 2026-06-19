# sapi-pro安装

## 执行顺序

安装前按以下顺序执行：

1. 判断项目使用 Beta API 还是 Stable API
2. 判断是否是空项目及项目是否已经具备打包能力
3. 选择对应安装方案
4. 安装 sapi-pro
5. 验证安装结果

## 版本判断

安装前必须先确定项目使用的 Minecraft Script API 版本。

### 根据package.json

优先检查 package.json中的`@minecraft`开头的包如：

```json
{
    "@minecraft/server": "2.8.0-beta.1.26.21-stable"
}
```

规则：

- 若版本字符串包含 -beta或-preview，则项目使用 Beta API。
- 若版本为普通版本号（如 2.6.0），则项目使用 Stable API。

### 根据manifest.json

如果项目不存在 package.json，则检查行为包 manifest.json 中的依赖配置。

根据其中引用的 Minecraft Script API 版本判断使用 Beta API 还是 Stable API。

### 安装版本

Beta API：
`npm i sapi-pro@latest`
Stable API：
`npm i sapi-pro@stable`

禁止在未确认 API 版本时直接安装 sapi-pro。

## 从零开始创建项目

如果用户希望创建一个新的 Minecraft Bedrock Script 项目，则优先使用 `sapi-kit`作为打包工具。

1. 确保sapi-kit已安装
2. 确认项目要使用的的ScriptAPI版本，稳定版or Beta版，可咨询用户
3. 根据选定版本，使用对应的标签
    1. 使用beta版本API
        - `npm i @minecraft/server@beta`
        - `npm i @minecraft/server-ui@beta`
    2. 使用稳定版本API
        - `npm i @minecraft/server@latest`
4. 安装指定版本的@minecraft包和sapi-pro包
5. 创建manifest.json
    - 如果使用稳定版，则依赖直接写对应的版本号
    - 如果使用beta版，则依赖直接写beta
      例如:
    ```json
    "dependencies": [
        {
            "module_name": "@minecraft/server",
            "version": "beta"
        },
        {
            "module_name": "@minecraft/server-ui",
            "version": "beta"
        }
    ]
    ```

## 已有项目

### 已有打包工具

如果项目已经具备打包能力，则直接安装 sapi-pro的对应版本，版本选择必须遵守“版本判断”章节。

常见打包工具：

- esbuild
- rollup/rolldown
- tsup
- 用户自定义构建脚本

### 无打包工具

如果项目没有任何打包工具：

1. 告知用户推荐使用 sapi-kit。
2. 获得用户同意后安装 sapi-kit。
3. 安装 sapi-pro (遵循版本判断章节)。
4. 创建或修改：
    - sapi-kit.config.mjs(参考sapi-kit/sapi-kit.md)
    - tsconfig.json

## 安装后验证

安装完成后检查：

### 依赖检查

确认 package.json 中存在：

- sapi-pro
- @minecraft/server
- @minecraft/server-ui

### 版本检查

确认：

- Beta API 对应 sapi-pro Beta 版
- Stable API 对应 sapi-pro Stable 版

### 配置检查

如果使用 sapi-kit：

- sapi-kit.config.mjs存在
- 命令 `sapi-kit check` 通过
- tsconfig.json 存在且对应
- tsgo/tsc 已全局安装或项目安装

### 构建检查

如果项目具备构建命令，则执行一次构建，确保依赖安装正确。
