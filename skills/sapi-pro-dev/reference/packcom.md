## 多包通信

多包通信基于统一的数据与事件机制实现，用于在不同模块（包）之间进行信息共享与功能调用。

### 数据通信

使用以下数据库实现跨包数据共享：

- ScoreboardDataBase
- ScoreboardJSONDataBase

共享数据结构统一存储于 `exchangedb` 中，用于：

- 包信息注册（`packs`）
- 命令注册（`cmd`）
- 主模块标识（`Host`）

### 表单通信

使用以下方法实现跨包 UI 调用：

- formManager.openExternal

底层通过 `scriptEvent` 进行事件分发，实现模块间解耦调用。
