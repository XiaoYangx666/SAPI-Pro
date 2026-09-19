[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / CompactDPDataBase

# Class: CompactDPDataBase

固定 schema 的紧凑 DynamicProperty 数据库。对象按 schema 顺序编码为 JSON 数组，不在每条记录中重复保存字段名。

## Example

```ts
const db = new CompactDPDataBase("money", [
    ["name", "string"],
    ["money", "int"],
    ["trusted", "boolean"],
] as const);

db.set(player.id, {
    name: player.name,
    money: 10000,
    trusted: false,
});
```

上例实际存储类似：

```json
["XiaoYangx666",10000,0]
```

## Constructor

> **new CompactDPDataBase**(`name`, `fields`, `source?`)

- `name: string`：数据库名。
- `fields`：有序 schema，支持 `string` / `int` / `number` / `boolean`。
- `source?: DPSource`：默认 `world`，也可使用实体、ItemStack 等 DPSource。

## Methods

### set()

> **set**(`key`, `value`): `void`

只接受与 schema 完全一致的对象。缺字段、多字段或类型错误会抛出 `CompactEncodeError`。

### setAsync()

> **setAsync**(`key`, `value`): `Promise<void>`

与 `set()` 相同，但大字符串分片准备使用异步路径。

### get()

> **get**(`key`): schema 对应对象 | `undefined`

键不存在或记录格式无效时返回 `undefined`。损坏记录不会被自动删除。

### read()

> **read**(`key`): `CompactReadResult<T>`

区分三种状态：

```ts
{ status: "ok", value }
{ status: "missing" }
{ status: "invalid", error }
```

### rm()

删除一条记录。

### keys()

返回当前数据库的键。

### clear()

清空当前数据库。

## Schema evolution

已投入使用的字段顺序、类型和语义必须保持稳定。兼容旧记录时只能在末尾追加带 `default` 的字段：

```ts
["gamesPlayed", "int", { default: 0 }]
```

一旦开始使用 `default`，后续字段也必须提供 `default`。
