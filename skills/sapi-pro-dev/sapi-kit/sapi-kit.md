# sapi-kit简介

sapi-kit是专为基岩版ScriptApi设计的打包工具，包含各种命令。

### 可用命令

| 命令     | 功能说明                    |
| -------- | --------------------------- |
| `build`  | 构建行为包                  |
| `pack`   | 打包 mcpack/mcaddon         |
| `dev`    | 启动监听模式                |
| `copy`   | 复制行为包/资源包到游戏目录 |
| `update` | 更新配置/依赖资源           |
| `init`   | 一键初始化项目              |
| `check`  | 检查配置文件是否正确        |

### 构建流程简述

sapi-kit通过tsc/tsgo编译项目源码到cache目录，再通过rolldown和tsc-alias，将导入的npm包打包，最终输出到scripts目录。

### 配置

sapi-kit 的配置文件为`sapi-kit.config.mjs`。通过默认导出来导出config,如：`export default xxx`

如果需要安装sapi-kit，修改配置参数，或解决sapi-kit工具的报错，请参考: sapi-kit/config.md ，其它情况禁止阅读此文档。
