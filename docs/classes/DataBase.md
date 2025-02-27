[**Documentation**](../README.md)

***

[Documentation](../globals.md) / DataBase

# Class: `abstract` DataBase\<T\>

Defined in: DataBase.ts:5

## Extended by

- [`ScoreBoardDataBase`](ScoreBoardDataBase.md)
- [`DPDataBase`](DPDataBase.md)
- [`ScoreBoardJSONDataBase`](ScoreBoardJSONDataBase.md)

## Type Parameters

• **T**

## Constructors

### new DataBase()

> **new DataBase**\<`T`\>(`name`): [`DataBase`](DataBase.md)\<`T`\>

Defined in: DataBase.ts:10

#### Parameters

##### name

`string`

#### Returns

[`DataBase`](DataBase.md)\<`T`\>

## Properties

### name

> **name**: `string`

Defined in: DataBase.ts:8

***

### type

> **type**: `undefined` \| `"DP"` \| `"jSB"` \| `"cSB"`

Defined in: DataBase.ts:9

***

### DBMap

> `static` **DBMap**: `Record`\<`string`, [`DataBase`](DataBase.md)\<`any`\>\> = `{}`

Defined in: DataBase.ts:7

***

### maxChunkBytes

> `static` **maxChunkBytes**: `number` = `32767`

Defined in: DataBase.ts:6

## Methods

### clear()

> `abstract` **clear**(): `void`

Defined in: DataBase.ts:18

#### Returns

`void`

***

### get()

> `abstract` **get**(`key`): `undefined` \| `T`

Defined in: DataBase.ts:15

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `T`

***

### keys()

> `abstract` **keys**(): `string`[]

Defined in: DataBase.ts:17

#### Returns

`string`[]

***

### rm()

> `abstract` **rm**(`key`): `void`

Defined in: DataBase.ts:16

#### Parameters

##### key

`string`

#### Returns

`void`

***

### set()

> `abstract` **set**(`key`, `value`): `void`

Defined in: DataBase.ts:14

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

Defined in: DataBase.ts:19

#### Returns

`void`

***

### getAllKeys()

> `static` **getAllKeys**(): `string`[]

Defined in: DataBase.ts:25

#### Returns

`string`[]

***

### getByteCount()

> `static` **getByteCount**(): `number`

Defined in: DataBase.ts:22

#### Returns

`number`

***

### getDB()

> `static` **getDB**(`name`): `undefined` \| [`DataBase`](DataBase.md)\<`any`\>

Defined in: DataBase.ts:28

#### Parameters

##### name

`string`

#### Returns

`undefined` \| [`DataBase`](DataBase.md)\<`any`\>

***

### getDBs()

> `static` **getDBs**(): [`DataBase`](DataBase.md)\<`any`\>[]

Defined in: DataBase.ts:31

#### Returns

[`DataBase`](DataBase.md)\<`any`\>[]
