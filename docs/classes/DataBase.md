[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / DataBase

# Abstract Class: DataBase\<T\>

## Extended by

- [`DPDataBase`](DPDataBase.md)
- [`ScoreBoardJSONDataBase`](ScoreBoardJSONDataBase.md)
- [`ScoreBoardDataBase`](ScoreBoardDataBase.md)

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new DataBase**\<`T`\>(`name`, `type`): `DataBase`\<`T`\>

#### Parameters

##### name

`string`

##### type

[`DBTypes`](../type-aliases/DBTypes.md)

#### Returns

`DataBase`\<`T`\>

## Properties

### name

> **name**: `string`

***

### type

> **type**: [`DBTypes`](../type-aliases/DBTypes.md)

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

> `abstract` **get**(`key`): `T` \| `undefined`

#### Parameters

##### key

`string`

#### Returns

`T` \| `undefined`

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

> `static` **getDB**(`name`): `DataBase`\<`any`\> \| `undefined`

#### Parameters

##### name

`string`

#### Returns

`DataBase`\<`any`\> \| `undefined`

***

### getDBs()

> `static` **getDBs**(): `DataBase`\<`any`\>[]

#### Returns

`DataBase`\<`any`\>[]
