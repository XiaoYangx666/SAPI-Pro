[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / DPDataBase

# Class: DPDataBase

## Extends

- [`DataBase`](DataBase.md)\<`DPValueTypes`\>

## Constructors

### Constructor

> **new DPDataBase**(`name`): `DPDataBase`

#### Parameters

##### name

`string`

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

> **type**: `DBTypes`

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

> **entries**(): \[`string`, `DPValueTypes` \| `undefined`\][]

#### Returns

\[`string`, `DPValueTypes` \| `undefined`\][]

***

### get()

> **get**\<`T`\>(`key`): `T` \| `undefined`

#### Type Parameters

##### T

`T` *extends* `DPValueTypes` = `DPValueTypes`

#### Parameters

##### key

`string`

#### Returns

`T` \| `undefined`

#### Overrides

[`DataBase`](DataBase.md).[`get`](DataBase.md#get)

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

(`val`) => `val is T`

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

#### Parameters

##### key

`string`

##### value

`DPValueTypes`

#### Returns

`void`

#### Overrides

[`DataBase`](DataBase.md).[`set`](DataBase.md#set)

***

### setJSON()

> **setJSON**(`key`, `value`): `void`

以json形式存储一个对象

#### Parameters

##### key

`string`

##### value

`object`

#### Returns

`void`

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
