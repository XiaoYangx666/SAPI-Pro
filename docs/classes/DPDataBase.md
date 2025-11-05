[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / DPDataBase

# Class: DPDataBase

## Extends

- [`DataBase`](DataBase.md)\<`DPTypes`\>

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

> **type**: `undefined` \| `"DP"` \| `"jSB"` \| `"cSB"`

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

### get()

> **get**(`key`): `undefined` \| `string` \| `number` \| `boolean` \| `Vector3`

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `string` \| `number` \| `boolean` \| `Vector3`

#### Overrides

[`DataBase`](DataBase.md).[`get`](DataBase.md#get)

***

### getJSON()

> **getJSON**\<`T`\>(`key`): `undefined` \| `T`

获取json形式存储的对象，没有或转换错误返回undefined

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `T`

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

`DPTypes`

#### Returns

`void`

#### Overrides

[`DataBase`](DataBase.md).[`set`](DataBase.md#set)

***

### setJSON()

> **setJSON**\<`T`\>(`key`, `value`): `void`

以json形式存储一个对象

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### key

`string`

##### value

`T`

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

> `static` **getDB**(`name`): `undefined` \| [`DataBase`](DataBase.md)\<`any`\>

#### Parameters

##### name

`string`

#### Returns

`undefined` \| [`DataBase`](DataBase.md)\<`any`\>

#### Inherited from

[`DataBase`](DataBase.md).[`getDB`](DataBase.md#getdb)

***

### getDBs()

> `static` **getDBs**(): [`DataBase`](DataBase.md)\<`any`\>[]

#### Returns

[`DataBase`](DataBase.md)\<`any`\>[]

#### Inherited from

[`DataBase`](DataBase.md).[`getDBs`](DataBase.md#getdbs)

***

### isDPDataBase()

> `static` **isDPDataBase**(`db`): `db is DPDataBase`

#### Parameters

##### db

[`DataBase`](DataBase.md)\<`any`\>

#### Returns

`db is DPDataBase`
