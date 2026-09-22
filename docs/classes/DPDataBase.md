[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / DPDataBase

# Class: DPDataBase

> v0.4.3：`keys()` 支持下划线键，`clear()` 只清理当前数据库命名空间。分片长度标记损坏时，`get()` 不回退读取旧普通值；正常读写、删除不为异常数据全量枚举整个 DPSource。超过 1024 片的完整旧记录经过校验仍可读取。

## Extends

- [`DataBase`](DataBase.md)\<[`DPValueTypes`](../type-aliases/DPValueTypes.md)\>

## Constructors

### Constructor

> **new DPDataBase**(`name`, `source?`): `DPDataBase`

#### Parameters

##### name

`string`

##### source?

[`DPSource`](../interfaces/DPSource.md) = `world`

#### Returns

`DPDataBase`

#### Overrides

[`DataBase`](DataBase.md).[`constructor`](DataBase.md#constructor)

## Properties

### name

> **name**: `string`

#### Inherited from

[`DataBase`](DataBase.md).[`name`](DataBase.md#name)

***

### type

> **type**: [`DBTypes`](../type-aliases/DBTypes.md)

#### Inherited from

[`DataBase`](DataBase.md).[`type`](DataBase.md#type)

***

### DBMap

> `static` **DBMap**: `Record`\<`string`, [`DataBase`](DataBase.md)\<`any`\>\> = `{}`

#### Inherited from

[`DataBase`](DataBase.md).[`DBMap`](DataBase.md#dbmap)

***

### maxChunkBytes

> `static` **maxChunkBytes**: `number` = `32767`

#### Inherited from

[`DataBase`](DataBase.md).[`maxChunkBytes`](DataBase.md#maxchunkbytes)

## Methods

### clear()

> **clear**(): `void`

#### Returns

`void`

#### Overrides

[`DataBase`](DataBase.md).[`clear`](DataBase.md#clear)

***

### entries()

> **entries**(): \[`string`, [`DPValueTypes`](../type-aliases/DPValueTypes.md) \| `undefined`\][]

#### Returns

\[`string`, [`DPValueTypes`](../type-aliases/DPValueTypes.md) \| `undefined`\][]

***

### get()

> **get**\<`T`\>(`key`): `T` \| `undefined`

#### Type Parameters

##### T

`T` *extends* [`DPValueTypes`](../type-aliases/DPValueTypes.md) = [`DPValueTypes`](../type-aliases/DPValueTypes.md)

#### Parameters

##### key

`string`

#### Returns

`T` \| `undefined`

#### Overrides

[`DataBase`](DataBase.md).[`get`](DataBase.md#get)

***

### has()

> **has**(`key`): `boolean`

判断键是否存在。对于分片记录，即使分片长度标记存在但内容已经损坏，也会返回 `true`，可用于区分“键不存在”和“记录存在但无法完整读取”。

#### Parameters

##### key

`string`

#### Returns

`boolean`

***

### getJSON()

> **getJSON**\<`T`\>(`key`, `guard?`): `T` \| `undefined`

获取JSON形式存储的对象，可选使用类型守卫进行校验

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### key

`string`

键名

##### guard?

[`ValueGuard`](../type-aliases/ValueGuard.md)\<`T`\>

可选类型守卫函数

#### Returns

`T` \| `undefined`

解析后的数据，失败或校验不通过返回 undefined

***

### getrealKeys()

> **getrealKeys**(): `string`[]

获取所有键，包括list的的键,并保留DP前缀

#### Returns

`string`[]

***

### keys()

> **keys**(): `string`[]

获取所有键

#### Returns

`string`[]

#### Overrides

[`DataBase`](DataBase.md).[`keys`](DataBase.md#keys)

***

### rm()

> **rm**(`key`): `void`

#### Parameters

##### key

`string`

#### Returns

`void`

#### Overrides

[`DataBase`](DataBase.md).[`rm`](DataBase.md#rm)

***

### set()

> **set**(`key`, `value`): `void`

设置值（同步）
- 小数据直接写入
- 大字符串同步分片写入（可能造成卡顿）

#### Parameters

##### key

`string`

##### value

[`DPValueTypes`](../type-aliases/DPValueTypes.md)

#### Returns

`void`

#### Overrides

[`DataBase`](DataBase.md).[`set`](DataBase.md#set)

***

### setAsync()

> **setAsync**(`key`, `value`): `Promise`\<`void`\>

设置值（异步）
- 小数据直接写入
- 大字符串异步分片写入（避免卡顿）

#### Parameters

##### key

`string`

##### value

[`DPValueTypes`](../type-aliases/DPValueTypes.md)

#### Returns

`Promise`\<`void`\>

***

### setJSON()

> **setJSON**(`key`, `value`): `Promise`\<`void`\>

以json形式存储一个对象

#### Parameters

##### key

`string`

##### value

`object`

#### Returns

`Promise`\<`void`\>

***

### clearAllDP()

> `static` **clearAllDP**(): `void`

#### Returns

`void`

***

### getAllKeys()

> `static` **getAllKeys**(): `string`[]

#### Returns

`string`[]

***

### getByteCount()

> `static` **getByteCount**(): `number`

#### Returns

`number`

***

### getDB()

> `static` **getDB**(`name`): [`DataBase`](DataBase.md)\<`any`\> \| `undefined`

#### Parameters

##### name

`string`

#### Returns

[`DataBase`](DataBase.md)\<`any`\> \| `undefined`

#### Inherited from

[`DataBase`](DataBase.md).[`getDB`](DataBase.md#getdb)

***

### getDBs()

> `static` **getDBs**(): [`DataBase`](DataBase.md)\<`any`\>[]

#### Returns

[`DataBase`](DataBase.md)\<`any`\>[]

#### Inherited from

[`DataBase`](DataBase.md).[`getDBs`](DataBase.md#getdbs)
