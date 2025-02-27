[**Documentation**](../README.md)

***

[Documentation](../globals.md) / DPDataBase

# Class: DPDataBase

Defined in: DataBase.ts:35

## Extends

- [`DataBase`](DataBase.md)\<`DPTypes`\>

## Constructors

### new DPDataBase()

> **new DPDataBase**(`name`): [`DPDataBase`](DPDataBase.md)

Defined in: DataBase.ts:39

#### Parameters

##### name

`string`

#### Returns

[`DPDataBase`](DPDataBase.md)

#### Overrides

[`DataBase`](DataBase.md).[`constructor`](DataBase.md#constructors)

## Properties

### name

> **name**: `string`

Defined in: DataBase.ts:8

#### Inherited from

[`DataBase`](DataBase.md).[`name`](DataBase.md#name-1)

***

### type

> **type**: `undefined` \| `"DP"` \| `"jSB"` \| `"cSB"`

Defined in: DataBase.ts:9

#### Inherited from

[`DataBase`](DataBase.md).[`type`](DataBase.md#type)

***

### DBMap

> `static` **DBMap**: `Record`\<`string`, [`DataBase`](DataBase.md)\<`any`\>\> = `{}`

Defined in: DataBase.ts:7

#### Inherited from

[`DataBase`](DataBase.md).[`DBMap`](DataBase.md#dbmap)

***

### maxChunkBytes

> `static` **maxChunkBytes**: `number` = `32767`

Defined in: DataBase.ts:6

#### Inherited from

[`DataBase`](DataBase.md).[`maxChunkBytes`](DataBase.md#maxchunkbytes)

## Methods

### clear()

> **clear**(): `void`

Defined in: DataBase.ts:94

#### Returns

`void`

#### Overrides

[`DataBase`](DataBase.md).[`clear`](DataBase.md#clear)

***

### get()

> **get**(`key`): `undefined` \| `string` \| `number` \| `boolean` \| `Vector3`

Defined in: DataBase.ts:54

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `string` \| `number` \| `boolean` \| `Vector3`

#### Overrides

[`DataBase`](DataBase.md).[`get`](DataBase.md#get)

***

### getJSON()

> **getJSON**(`key`): `undefined` \| `object`

Defined in: DataBase.ts:84

获取json形式存储的对象

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `object`

***

### getrealKeys()

> **getrealKeys**(): `string`[]

Defined in: DataBase.ts:68

#### Returns

`string`[]

***

### keys()

> **keys**(): `string`[]

Defined in: DataBase.ts:71

#### Returns

`string`[]

#### Overrides

[`DataBase`](DataBase.md).[`keys`](DataBase.md#keys)

***

### rm()

> **rm**(`key`): `void`

Defined in: DataBase.ts:61

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

Defined in: DataBase.ts:47

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

> **setJSON**(`key`, `value`): `void`

Defined in: DataBase.ts:79

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

Defined in: DataBase.ts:19

#### Returns

`void`

#### Inherited from

[`DataBase`](DataBase.md).[`clearAllDP`](DataBase.md#clearalldp)

***

### getAllKeys()

> `static` **getAllKeys**(): `string`[]

Defined in: DataBase.ts:25

#### Returns

`string`[]

#### Inherited from

[`DataBase`](DataBase.md).[`getAllKeys`](DataBase.md#getallkeys)

***

### getByteCount()

> `static` **getByteCount**(): `number`

Defined in: DataBase.ts:22

#### Returns

`number`

#### Inherited from

[`DataBase`](DataBase.md).[`getByteCount`](DataBase.md#getbytecount)

***

### getDB()

> `static` **getDB**(`name`): `undefined` \| [`DataBase`](DataBase.md)\<`any`\>

Defined in: DataBase.ts:28

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

Defined in: DataBase.ts:31

#### Returns

[`DataBase`](DataBase.md)\<`any`\>[]

#### Inherited from

[`DataBase`](DataBase.md).[`getDBs`](DataBase.md#getdbs)

***

### isDPDataBase()

> `static` **isDPDataBase**(`db`): `db is DPDataBase`

Defined in: DataBase.ts:151

#### Parameters

##### db

[`DataBase`](DataBase.md)\<`any`\>

#### Returns

`db is DPDataBase`
