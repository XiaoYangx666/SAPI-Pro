[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / ScoreBoardJSONDataBase

# Class: ScoreBoardJSONDataBase

## Extends

- [`DataBase`](DataBase.md)\<`object`\>

## Constructors

### new ScoreBoardJSONDataBase()

> **new ScoreBoardJSONDataBase**(`name`): [`ScoreBoardJSONDataBase`](ScoreBoardJSONDataBase.md)

#### Parameters

##### name

`string`

#### Returns

[`ScoreBoardJSONDataBase`](ScoreBoardJSONDataBase.md)

#### Overrides

[`DataBase`](DataBase.md).[`constructor`](DataBase.md#constructors)

## Properties

### name

> **name**: `string`

#### Inherited from

[`DataBase`](DataBase.md).[`name`](DataBase.md#name-1)

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

### edit()

> **edit**(`callback`): `void`

#### Parameters

##### callback

(`data`) => `undefined` \| `boolean` \| `void`

#### Returns

`void`

***

### get()

> **get**(`key`): `any`

#### Parameters

##### key

`string`

#### Returns

`any`

#### Overrides

[`DataBase`](DataBase.md).[`get`](DataBase.md#get)

***

### keys()

> **keys**(): `string`[]

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

`object`

#### Returns

`void`

#### Overrides

[`DataBase`](DataBase.md).[`set`](DataBase.md#set)

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
