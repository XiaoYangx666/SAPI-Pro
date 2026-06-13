# 游戏内数据库

## 概述

`DataBase` 模块提供三种不同实现的数据存储方案，用于在 MC Script API 环境中进行数据管理与跨行为包通信。

支持以下数据库类型：

| 类型                   | 标识  | 描述                                       |
| ---------------------- | ----- | ------------------------------------------ |
| DPDataBase             | `DP`  | 基于 DynamicProperty 的持久化存储          |
| ScoreBoardJSONDataBase | `jSB` | 基于计分板的 JSON 数据存储（支持跨包通信） |
| ScoreBoardDataBase     | `cSB` | 对原版计分板的封装                         |

---

## 导入

```ts
import { DPDataBase, ScoreBoardJSONDataBase, ScoreBoardDataBase } from "sapi-pro/DataBase";
```

---

## DataBase 基类

所有数据库均继承自 `DataBase<T>`。

通常无需直接使用 DataBase，而应使用具体实现类。

---

## DPDataBase

基于 `DynamicProperty` 实现的数据存储。

### 构造函数

```ts
constructor(name: string, source: DPSource = world)
```

第二个参数 `source` 支持 `World`、`Entity`、`ItemStack`，默认为 `world`。

### 特性

- 数据持久化存储
- 按行为包隔离
- 自动处理长字符串分片
- 性能较高

#### JSON 存储

```ts
setJSON(key: string, value: object): Promise<void>
```

```ts
getJSON<T = unknown>(
    key: string,
    guard?: (val: unknown) => val is T
): T | undefined
```

说明：

- 数据以 JSON 字符串形式存储
- 支持通过类型守卫进行校验
- JSON 解析失败时返回 `undefined`

### 示例

```ts
const db = new DPDataBase("MyData");

db.set("key", "value");
const value = db.get<string>("key");
```

### 内置数据库

```ts
import { Configdb } from "sapi-pro/DataBase";
```

对于行为包配置数据,优先使用内置的 Configdb。
不需要手动创建新的 DPDataBase 实例。

---

## ScoreBoardJSONDataBase

基于计分板存储 JSON 数据。

### 特性

- 支持复杂对象存储
- 支持大数据量
- 适用于跨行为包通信

### 示例

```ts
const db = new ScoreBoardJSONDataBase("data");

db.set("player", { score: 100 });

const data = db.get<{ score: number }>("player");
```

---

## ScoreBoardDataBase

对原版计分板的封装。

### 构造函数

```ts
constructor(
    name: string,
    displayName?: string,
    usePrefix: boolean = true
)
```

计分板名称：

```
(usePrefix ? "cSB_" : "") + name
```

#### 生命周期

```ts
dispose(): void
```

删除计分板对象（再次访问时会自动重建）。

### 示例

```ts
const sb = new ScoreBoardDataBase("record");

sb.set("player", 10);
sb.add("player", 5);

const score = sb.get("player");
```

---

## scoreboardObj

用于操作单个计分项的封装对象。

### 示例

```ts
const obj = sb.getObj("player");

obj.add(10);

if (obj.isValid()) {
    console.log(obj.get());
}
```

---

## 数据库选型建议

| 使用场景      | 推荐类型               |
| ------------- | ---------------------- |
| 配置存储      | DPDataBase             |
| 大文本数据    | DPDataBase             |
| 跨行为包通信  | ScoreBoardJSONDataBase |
| 积分/排行系统 | ScoreBoardDataBase     |

---

## 注意事项

1. DynamicProperty 存储存在大小限制(约10mb)，应避免频繁写入超大数据
2. ScoreBoardJSONDataBase 每次读写都会进行 JSON 序列化与反序列化，应避免存储大量内容
3. ScoreBoardDataBase 仅适用于数值数据
4. 长字符串操作已内部封装，无需手动处理
