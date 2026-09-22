**Documentation**

---

# 游戏内数据库

## 目录

- [概述](#概述)
- [导入](#导入)
- [DataBase 基类](#database-基类)
- [DPDataBase](#dpdatabase)
- [CompactDPDataBase](#compactdpdatabase)
- [ScoreBoardJSONDataBase](#scoreboardjsondatabase)
- [ScoreBoardDataBase](#scoreboarddatabase)
- [scoreboardObj](#scoreboardobj)
- [数据库选型建议](#数据库选型建议)
- [注意事项](#注意事项)

## 概述

`DataBase` 模块提供多种存储方案，用于在 MC Script API 环境中进行数据管理与跨行为包通信。

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
} from "SAPI-Pro/DataBase";
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

用于存储所有已注册的全局数据库实例。全局数据库在构造时自动注册；以非 `world` 的 `DPSource`（如实体或物品堆）创建的 `DPDataBase` 属于局部实例，不进入该全局注册表。

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
constructor(name: string, source: DPSource = world)
```

第二个参数 `source` 支持 `World`、`Entity`、`ItemStack`，默认为 `world`。只有使用 `world` 的 `DPDataBase` 会注册到 `DataBase.DBMap`；实体、物品堆等局部 DP 数据库不会占用或覆盖全局同名注册项。

---

### DPSource 接口

用于抽象 DynamicProperty 操作的数据源，支持世界、实体和物品堆。

```ts
interface DPSource {
    setDynamicProperty(identifier: string, value?: boolean | number | string | Vector3): void;
    getDynamicProperty(identifier: string): boolean | number | string | Vector3 | undefined;
    getDynamicPropertyIds(): string[];
    clearDynamicProperties(): void;
    getDynamicPropertyTotalByteCount(): number;
}
```

---

### 基础方法

```ts
set(key: string, value: DPValueTypes): void
get<T = DPValueTypes>(key: string): T | undefined
has(key: string): boolean
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

**v0.4.3 分片与清理说明：**正常 DP 读写、正常分片覆写及删除不会全量枚举动态属性。分片长度标记存在但损坏时，读取返回 `undefined`，不会回退返回旧普通值；可通过覆写或 `rm()` 处理。异常长度及旧版超大记录会触发实际分片检查，1024 片是额外校验阈值，**不是大小上限**。标记明显异常时删除会枚举数据源来清理该键分片；标记丢失或错误地记录为较小有效整数时，正常路径不会扫描以寻找所有孤立分片。

**键名与作用域：**`keys()` 支持下划线；`clear()` 只清理当前数据库的 `<name>.` 命名空间，不误清同名前缀的其他数据库。

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

## CompactDPDataBase

用于大量“同结构记录”的紧凑 DynamicProperty 存储。它只接受构造时声明的 schema，并按 schema 的字段位置保存值，不会在每条记录里重复保存字段名。

第三个构造参数可指定实体等 DPSource。仅使用 `world` 的数据库进入全局注册表；实体数据库与同名世界数据库互不覆盖。记录损坏时 `read()` 区分 `missing` 和 `invalid`，不自动删除原始数据。

### 适用场景

- 玩家账户、统计、冷却时间等大量同构记录
- 希望减少 JSON 对象重复字段名的空间开销
- 数据结构由代码控制，不需要自由扩展字段

配置、经常变化的对象或需要自由扩展字段的数据仍然更适合 `DPDataBase.setJSON()`。

### Schema 与字段位置

schema 使用数组显式定义字段顺序，**不是按 key 排序**：

```ts
const moneyDb = new CompactDPDataBase("money", [
    ["name", "string"],
    ["money", "int"],
    ["welfareDay", "int"],
    ["trusted", "boolean"],
] as const);
```

上面的持久化协议固定为：

```text
0 -> name
1 -> money
2 -> welfareDay
3 -> trusted
```

支持字段类型：

| 类型 | 说明 |
| --- | --- |
| `string` | 任意字符串 |
| `int` | JavaScript 安全整数 |
| `number` | 有限浮点数 |
| `boolean` | 对外为 boolean，存储时压缩为 `0` / `1` |

### 编码格式

内部采用**位置 JSON 数组**，而不是自定义分隔符协议。

例如：

```ts
moneyDb.set("player-id", {
    name: "小阳|x666",
    money: 10000,
    welfareDay: 20345,
    trusted: true,
});
```

实际值类似：

```json
["小阳|x666",10000,20345,1]
```

相比对象 JSON：

```json
{"name":"小阳|x666","money":10000,"welfareDay":20345,"trusted":true}
```

位置数组不重复保存 `name`、`money`、`welfareDay`、`trusted` 等字段名。字符串边界与转义交给标准 JSON 处理，因此字符串中包含 `|`、`:`、引号或反斜杠时也不需要维护自定义 stuffing/escape 协议。

数组长度同时表示该记录包含的字段数量，可用于 append-only schema 演进。

### 运行时格式校验

写入时会校验：

- 必须是对象；
- 字段必须与 schema **完全一致**；
- 不允许缺字段、额外字段或 symbol 字段；
- `int` 必须是安全整数；
- `number` 不允许 `NaN` / `Infinity`；
- 所有字段类型必须正确。

非法写入会抛出 `CompactEncodeError`，编码失败前不会修改原数据。

读取时会检查：

- 底层 DP 是否能完整还原；
- 是否为合法 JSON；
- JSON 根值是否为数组；
- 数组字段数量是否超过当前 schema；
- 每个位置的值是否符合 schema 类型；
- 缺少的新尾字段是否提供了 `default`。

`get()` 在记录损坏时返回 `undefined` 并记录 warning，不会自动删除或覆盖原始数据。

需要区分“不存在”和“损坏”时使用：

```ts
const result = moneyDb.read("player-id");

if (result.status === "ok") {
    console.log(result.value);
} else if (result.status === "missing") {
    // 没有这条记录
} else {
    // result.status === "invalid"
    console.warn(result.error.code, result.error.field);
}
```

常见错误码包括 `invalid_json`、`invalid_shape`、`schema_mismatch`、`invalid_value`、`missing_field` 和 `storage_corrupt`。

### Schema 演进

位置编码依赖字段位置，因此已投入使用的 schema：

1. 不得重排已有字段；
2. 不得删除已有字段；
3. 不得改变已有字段的类型或语义；
4. 新字段只能追加到末尾。

如果新字段需要兼容旧记录，必须提供 `default`：

```ts
const db = new CompactDPDataBase("money", [
    ["name", "string"],
    ["money", "int"],
    ["welfareDay", "int"],
    ["gamesPlayed", "int", { default: 0 }],
    ["trusted", "boolean", { default: false }],
] as const);
```

一旦出现带 `default` 的字段，后续字段也必须带 `default`。新记录仍然写入完整 schema；`default` 只用于读取数组长度更短的旧记录。

旧 schema 尝试读取字段更多的新记录时会返回 `schema_mismatch`，不会静默忽略未知尾字段。

### 长字符串

`CompactDPDataBase` 内部复用 `DPDataBase`，因此编码结果超过 Dynamic Property 单值限制时仍会自动分片。底层分片缺失或类型损坏会被 `read()` 识别为 `storage_corrupt`，而不是误判为键不存在。

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
| 大量固定结构记录 | CompactDPDataBase   |
| 大文本数据    | DPDataBase             |
| 跨行为包通信  | ScoreBoardJSONDataBase |
| 积分/排行系统 | ScoreBoardDataBase     |

---

## 注意事项

1. DynamicProperty 存储存在大小限制，应避免频繁写入超大数据
2. ScoreBoardJSONDataBase 每次读写都会进行 JSON 序列化与反序列化，应避免存储大量内容
3. ScoreBoardDataBase 仅适用于数值数据
4. CompactDPDataBase 的 schema 顺序属于持久化协议，发布后不要重排或在中间插入字段
5. 长字符串操作已内部封装，无需手动处理

---
