# Documentation

---

## 多包通信

多包通信基于统一的数据与事件机制实现，用于在不同模块（包）之间进行信息共享与功能调用。

### 数据通信

使用以下数据库实现跨包数据共享：

- [ScoreboardDataBase](../docs/classes/ScoreBoardDataBase.md)
- [ScoreboardJSONDataBase](../docs/classes/ScoreBoardJSONDataBase.md)

共享数据结构统一存储于 `exchangedb` 中，用于：

- 包信息注册（`packs`）
- 命令注册（`cmd`）
- 主模块标识（`Host`）

---

### 表单通信

使用以下方法实现跨包 UI 调用：

- [formManager.openExternal](../docs/classes/FormManagerClass.md#openexternal)

底层通过 `scriptEvent` 进行事件分发，实现模块间解耦调用。

---

## 包通信流程说明

### 启动阶段

1. 初始化通信环境：
    - 重置共享数据：
        - `packs`
        - `cmd`
        - `Host`

2. 所有包启动后注册自身信息：
    - 写入 `exchangedb.packs`

3. 参与通信的包进行主机选举：
    - 仅参与包进入选举流程
    - 选出唯一主模块（Host）

---

### 命令通信

#### 注册阶段

- 子模块（Client）：
    - 将自身命令注册到共享数据库：
        ```
        exchangedb.cmd[uuid] = commands
        ```

- 主模块（Host）：
    - 读取 `exchangedb.cmd`
    - 汇总所有命令
    - 建立命令索引（仅用于识别来源，不接管执行逻辑）

---

#### 执行阶段

1. 玩家输入命令
2. 主模块（Host）统一接收命令请求
3. 根据命令归属进行处理：
    - 若为主模块命令 → 由主模块执行
    - 若为子模块命令 → 主模块不处理

4. 命令由其注册模块自行处理完成

---

### 表单通信

1. 调用方向外发送事件：

```ts
system.sendScriptEvent("form:open", data);
```

2. 目标模块监听事件并处理：

- 校验 `nameSpace`
- 判断是否属于当前模块

3. 匹配成功后执行：

- 打开对应表单
- 传递参数并进入本地处理流程

---

## 总体结构

- 数据通信：`exchangedb`
- 事件通信：`scriptEvent`
- 架构模式：
    - 单主模块（Host）负责调度与汇总
    - 多子模块（Client）负责具体实现与执行
