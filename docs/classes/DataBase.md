[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / DataBase

# Class: `abstract` DataBase\<T\>

## Extended by

- [`ScoreBoardDataBase`](ScoreBoardDataBase.md)
- [`DPDataBase`](DPDataBase.md)
- [`ScoreBoardJSONDataBase`](ScoreBoardJSONDataBase.md)

## Type Parameters

• **T**

## Constructors

### new DataBase()

> **new DataBase**\<`T`\>(`name`): [`DataBase`](DataBase.md)\<`T`\>

#### Parameters

##### name

`string`

#### Returns

[`DataBase`](DataBase.md)\<`T`\>

## Properties

### name

> **name**: `string`

***

### type

> **type**: `undefined` \| `"DP"` \| `"jSB"` \| `"cSB"`

***

### DBMap

> `static` **DBMap**: `Record`\<`string`, [`DataBase`](DataBase.md)\<`any`\>\> = `{}`

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

> `static` **getDB**(`name`): `undefined` \| [`DataBase`](DataBase.md)\<`any`\>

#### Parameters

##### name

`string`

#### Returns

`undefined` \| [`DataBase`](DataBase.md)\<`any`\>

***

### getDBs()

> `static` **getDBs**(): [`DataBase`](DataBase.md)\<`any`\>[]

#### Returns

[`DataBase`](DataBase.md)\<`any`\>[]
