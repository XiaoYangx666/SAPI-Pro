# 游戏内数据库

## 概述

`DataBase` 模块提供多种数据存储方案，用于在 MC Script API 环境中进行数据管理与跨行为包通信。

支持以下数据库类型：

| 类型                   | 标识  | 描述                                       |
| ---------------------- | ----- | ------------------------------------------ |
| DPDataBase             | `DP`  | 基于 DynamicProperty 的持久化存储          |
| CompactDPDataBase      | `DP`  | 固定 schema 的紧凑位置编码 DP 存储         |
| ScoreBoardJSONDataBase | `jSB` | 基于计分板的 JSON 数据存储（支持跨包通信） |
| ScoreBoardDataBase     | `cSB` | 对原版计分板的封装                         |

---

## 导入

```ts
import {
    DPDataBase,
    CompactDPDataBase,
    ScoreBoardJSONDataBase,
    ScoreBoardDataBase,
} from "sapi-pro/DataBase";
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

## CompactDPDataBase

固定 schema 的紧凑 DynamicProperty 存储，适合玩家账户、统计、冷却等大量同构记录。字段位置由 schema 数组顺序显式定义，不按 key 排序。

```ts
const db = new CompactDPDataBase("money", [
    ["name", "string"],
    ["money", "int"],
    ["welfareDay", "int"],
    ["trusted", "boolean"],
] as const);

db.set(player.id, {
    name: player.name,
    money: 10000,
    welfareDay: 20345,
    trusted: false,
});
```

内部把对象按 schema 顺序编码为 JSON 数组，例如：

```json
["XiaoYangx666",10000,20345,0]
```

这样不重复保存字段名，同时直接复用 JSON 的字符串转义与格式解析，不维护自定义分隔符协议。

支持 `string`、`int`（安全整数）、`number`（有限数字）、`boolean`（存储为 0/1）。写入对象必须和 schema 字段完全一致，错误类型、缺字段、额外字段或 symbol 字段都会拒绝写入。

`get(key)` 在损坏记录上返回 `undefined`；需要区分“不存在”和“格式损坏”时使用：

```ts
const result = db.read(player.id);
// status: "ok" | "missing" | "invalid"
```

读取会检查底层 DP 分片完整性、JSON 格式、数组形状、字段数量与字段类型。

schema 投入使用后不可重排、删除或改变已有字段类型/语义。兼容旧记录只能在末尾追加带 `default` 的字段：

```ts
["gamesPlayed", "int", { default: 0 }]
```

一旦开始使用 `default`，后续字段也必须带 `default`。

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
| 大量固定结构记录 | CompactDPDataBase   |
| 大文本数据    | DPDataBase             |
| 跨行为包通信  | ScoreBoardJSONDataBase |
| 积分/排行系统 | ScoreBoardDataBase     |

---

## 注意事项

1. DynamicProperty 存储存在大小限制(约10mb)，应避免频繁写入超大数据
2. ScoreBoardJSONDataBase 每次读写都会进行 JSON 序列化与反序列化，应避免存储大量内容
3. ScoreBoardDataBase 仅适用于数值数据
4. CompactDPDataBase 的 schema 顺序属于持久化协议，发布后不要重排或中间插入字段
5. 长字符串操作已内部封装，无需手动处理
