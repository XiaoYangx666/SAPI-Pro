[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / DataBase

# Abstract Class: DataBase\<T\>

## Extended by

- [`DPDataBase`](DPDataBase.md)
- [`ScoreBoardDataBase`](ScoreBoardDataBase.md)
- [`ScoreBoardJSONDataBase`](ScoreBoardJSONDataBase.md)

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new DataBase**\<`T`\>(`name`): `DataBase`\<`T`\>

#### Parameters

##### name

`string`

#### Returns

`DataBase`\<`T`\>

## Properties

### name

> **name**: `string`

***

### type

> **type**: `undefined` \| `"DP"` \| `"jSB"` \| `"cSB"`

***

### DBMap

> `static` **DBMap**: `Record`\<`string`, `DataBase`\<`any`\>\> = `{}`

***

### maxChunkBytes

> `static` **maxChunkBytes**: `number` = `32767`

## Methods

### clear()

> `abstract` **clear**(): `void`

#### Returns

`void`

***

### get()

> `abstract` **get**(`key`): `undefined` \| `T`

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `T`

***

### keys()

> `abstract` **keys**(): `string`[]

#### Returns

`string`[]

***

### rm()

> `abstract` **rm**(`key`): `void`

#### Parameters

##### key

`string`

#### Returns

`void`

***

### set()

> `abstract` **set**(`key`, `value`): `void`

#### Parameters

##### key

`string`

##### value

`T`

#### Returns

`void`

***

### getDB()

> `static` **getDB**(`name`): `undefined` \| `DataBase`\<`any`\>

#### Parameters

##### name

`string`

#### Returns

`undefined` \| `DataBase`\<`any`\>

***

### getDBs()

> `static` **getDBs**(): `DataBase`\<`any`\>[]

#### Returns

`DataBase`\<`any`\>[]
