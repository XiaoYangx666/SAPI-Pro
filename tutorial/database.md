**Documentation**

---

# 游戏内数据库

## 目录

- [概述](#概述)
- [导入](#导入)
- [DataBase 基类](#database-基类)
- [DPDataBase](#dpdatabase)
- [ScoreBoardJSONDataBase](#scoreboardjsondatabase)
- [ScoreBoardDataBase](#scoreboarddatabase)
- [scoreboardObj](#scoreboardobj)
- [数据库选型建议](#数据库选型建议)
- [注意事项](#注意事项)

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
import { DPDataBase, ScoreBoardJSONDataBase, ScoreBoardDataBase } from "SAPI-Pro/DataBase";
```

---

## DataBase 基类

所有数据库均继承自 `DataBase<T>`。

### 类型定义

```ts
type DBTypes = "DP" | "jSB" | "cSB";
```

### 属性

```ts
name: string; // 数据库名称
type: DBTypes; // 数据库类型
```

### 静态属性

```ts
static DBMap: Record<string, DataBase<any>>
```

用于存储所有已注册的数据库实例。实例在构造时自动注册。

---

### 静态方法

```ts
static getDB(name: string): DataBase<any> | undefined
static getDBs(): DataBase<any>[]
```

---

### 抽象方法

```ts
set(key: string, value: T): void
get(key: string): T | undefined
rm(key: string): void
keys(): string[]
clear(): void
```

---

## DPDataBase

基于 `DynamicProperty` 实现的数据存储。

### 支持数据类型

```ts
type DPValueTypes = string | number | boolean | Vector3;
```

---

### 特性

- 数据持久化存储
- 按行为包隔离
- 自动处理长字符串分片
- 性能较高

---

### 构造函数

```ts
constructor(name: string)
```

---

### 基础方法

```ts
set(key: string, value: DPValueTypes): void
get<T = DPValueTypes>(key: string): T | undefined
rm(key: string): void
keys(): string[]
clear(): void
```

---

### 扩展方法

#### entries

```ts
entries(): [string, DPValueTypes | undefined][]
```

返回当前数据库所有键值对。

---

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

---

### 长字符串处理机制

当字符串长度超过限制时：

- 自动拆分为多个片段存储
- 使用以下结构：
    - `<key>_arrlen`：存储长度
    - `<key>_arr0 ~ n`：存储分片内容

该过程对外透明。

---

### 静态方法

```ts
static clearAllDP(): void
static getByteCount(): number
static getAllKeys(): string[]
```

---

### 示例

```ts
const db = new DPDataBase("MyData");

db.set("key", "value");
const value = db.get<string>("key");
```

---

### 内置数据库

```ts
import { Configdb } from "sapi-pro";
```

用于存储行为包配置数据。

---

## ScoreBoardJSONDataBase

基于计分板存储 JSON 数据。

---

### 特性

- 支持复杂对象存储
- 支持大数据量
- 适用于跨行为包通信

---

### 构造函数

```ts
constructor(name: string)
```

计分板名称格式：

```
jSB_<name>
```

---

### 基础方法

```ts
set(key: string, value: object): void
get<T = unknown>(key: string, guard?: (val: unknown) => val is T): T | undefined
rm(key: string): void
keys(): string[]
clear(): void
```

---

### 扩展方法

#### edit

```ts
edit<T extends Record<string, any>>(
    callback: (data: T) => boolean | void | undefined
): void
```

说明：

- 自动读取数据并传入回调
- 若返回 `false`，则取消写入
- 默认执行写回操作

---

### 数据存储机制

- 数据整体序列化为 JSON 字符串
- 字符串按长度拆分
- 每段以计分项形式存储：
    - 名称：`<index + 字符串片段>`
    - 分数：`index`

- 读取时按分数排序并拼接

---

### 示例

```ts
const db = new ScoreBoardJSONDataBase("data");

db.set("player", { score: 100 });

const data = db.get<{ score: number }>("player");
```

---

### 内置数据库

```ts
import { exchangedb } from "sapi-pro";
```

用于行为包之间的数据交换。

---

## ScoreBoardDataBase

对原版计分板的封装。

---

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

---

### 基础方法

```ts
set(key: string | Entity | ScoreboardIdentity, value: number | string): void
get(key: string | Entity | ScoreboardIdentity): number | undefined
add(key: string | Entity | ScoreboardIdentity, value: number | string): void
rm(key: string | Entity | ScoreboardIdentity): void
keys(): string[]
clear(): void
```

---

### 扩展方法

#### participants

```ts
participants(): ScoreboardIdentity[]
```

---

#### resetAll

```ts
resetAll(): void
```

重置所有计分项（使用命令实现）。

---

#### 显示控制

```ts
isDisplayAtSlot(slot: DisplaySlotId): boolean
setDisplaySlot(slot: DisplaySlotId): void
```

---

#### 生命周期

```ts
dispose(): void
```

删除计分板对象（再次访问时会自动重建）。

---

#### 虚拟对象

```ts
getObj(key: string | Entity | ScoreboardIdentity): scoreboardObj
```

---

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

---

### 构造函数

```ts
new scoreboardObj(
    db: ScoreBoardDataBase,
    key: string | Entity | ScoreboardIdentity
)
```

---

### 方法

```ts
get(): number | undefined
set(value: number): void
add(value: number): void
rm(): void
isValid(): boolean
```

---

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

1. DynamicProperty 存储存在大小限制，应避免频繁写入超大数据
2. ScoreBoardJSONDataBase 每次读写都会进行 JSON 序列化与反序列化，应避免存储大量内容
3. ScoreBoardDataBase 仅适用于数值数据
4. 长字符串操作已内部封装，无需手动处理

---
