**Documentation**

---

## 游戏内数据库

导入

```typescript
import { ScoreBoardDataBase, DPDataBase, ScoreBoardJSONDataBase } from "SAPI-Pro/DataBase";
```

### DPDataBase 动态数据数据库

存储在游戏 DynamicProperty 中，每个行为包是分开的。可以存储超大文本，最大不限，但超过 10mb 会报警告，而且可能导致游戏变卡。

##### constructor

`constructor(name: string):DPDataBase`

##### types

`type DPTypes = string | number | boolean | Vector3;`
这是 DP 数据库可以存储的所有数据类型

##### 函数

常规:
`set(key: string, value: DPTypes): void` 设置键值
`get(key: string): DPTypes|undefined `获取
`rm(key: string): void` 删除
`keys(): string[]` 获取该数据库所有键
`clear(): void` 清空所有键
特殊:
`setJSON(key: string, value: object): void`
将对象按 JSON 字符串形式在数据库存储
`getJSON(key: string): object | undefined`
获取按 JSON 格式存储的对象

要使用需要先 new 一个数据库，例如：

```typescript
const myDPDataBase = new DPDataBase("MyData");
myDPDataBase.set("SAPI-Pro", "nb");
```

系统内置了一个动态数据数据库 Configdb 用于存储行为包数据。

```typescript
import { Configdb } from "SAPI-Pro/DataBase";
```

---

### ScoreBoardJSONDataBase JSON 计分板数据库

使用 scoreboard 存储 JSON 数据，会新建一个计分板来存储。支持超大文本，读取超大文本性能较 DP 数据库略差。  
主要用于行为包之间临时大量数据传递，少量数据请使用 scriptEvent，存储配置请使用 DPDataBase。

##### constructor

`constructor(name: string):ScoreBoardJSONDataBase`

##### 函数

常规:
`set(key: string, value: object): void` 设置键值
`get(key: string): DPTypes|undefined `获取
`rm(key: string): void` 删除
`keys(): string[]` 获取该数据库所有键
`clear() :void` 清空所有键
特殊:
`edit(callback: (data: Record<string, any>) => boolean | void | undefined): void`
编辑一条记录

##### 使用

```typescript
const mySBDataBase = new ScoreBoardJSONDataBase("data");
//没有骂人
```

系统内置了一个 JSON 计分板数据库 exchangedb 用于交换行为包数据。

```typescript
import { exchangedb } from "SAPI-Pro/DataBase";
```

---

### ScoreBoardDataBase 计分板数据库

只是对原版的简单封装

##### constructor

`constructor(name: string, displayName?: string, usePrefix: boolean = true):ScoreBoardDataBase`

##### 函数

常规:
`set(key: string | Player, value: number | string): void` 设置键值
`get(key: string | Player): DPTypes|undefined `获取
`rm(key: string | Player): void` 删除
`keys(): string[]` 获取该数据库所有键
`clear() :void` 清空所有键
特殊:
`getObj(key: string | Player):scoreboardObj`
获取一个虚拟计分板对象(具体见下面)

##### 使用

```typescript
const mySB = new ScoreBoardDataBase("record");
//没有骂人
```

系统内置了一个计分板数据库 sysdb ，但现在好像没啥用了，你可以拿来用。拿来多包传传数据啥的。

```typescript
import { sysdb } from "SAPI-Pro/DataBase";
```

### scoreboardObj

一个虚拟计分板对象，可以方便管理某个玩家或某个特定计分项

##### 函数

`get():number|undefined`获取值
`set(value: number):void`设置值
`rm():void`
删除对应的计分项，但这个对象本身不会被删除(因为是虚拟的)
`isValid():boolean`判断这个计分项是否存在计分板
