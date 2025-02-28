[**Documentation**](../README.md)

***

[Documentation](../globals.md) / ScoreBoardJSONDataBase

# Class: ScoreBoardJSONDataBase

Defined in: [DataBase.ts:156](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L156)

## Extends

- [`DataBase`](DataBase.md)\<`object`\>

## Constructors

### new ScoreBoardJSONDataBase()

> **new ScoreBoardJSONDataBase**(`name`): [`ScoreBoardJSONDataBase`](ScoreBoardJSONDataBase.md)

Defined in: [DataBase.ts:159](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L159)

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

Defined in: [DataBase.ts:8](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L8)

#### Inherited from

[`DataBase`](DataBase.md).[`name`](DataBase.md#name-1)

***

### type

> **type**: `undefined` \| `"DP"` \| `"jSB"` \| `"cSB"`

Defined in: [DataBase.ts:9](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L9)

#### Inherited from

[`DataBase`](DataBase.md).[`type`](DataBase.md#type)

***

### DBMap

> `static` **DBMap**: `Record`\<`string`, [`DataBase`](DataBase.md)\<`any`\>\> = `{}`

Defined in: [DataBase.ts:7](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L7)

#### Inherited from

[`DataBase`](DataBase.md).[`DBMap`](DataBase.md#dbmap)

***

### maxChunkBytes

> `static` **maxChunkBytes**: `number` = `32767`

Defined in: [DataBase.ts:6](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L6)

#### Inherited from

[`DataBase`](DataBase.md).[`maxChunkBytes`](DataBase.md#maxchunkbytes)

## Methods

### clear()

> **clear**(): `void`

Defined in: [DataBase.ts:176](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L176)

#### Returns

`void`

#### Overrides

[`DataBase`](DataBase.md).[`clear`](DataBase.md#clear)

***

### edit()

> **edit**(`callback`): `void`

Defined in: [DataBase.ts:229](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L229)

#### Parameters

##### callback

(`data`) => `undefined` \| `boolean` \| `void`

#### Returns

`void`

***

### get()

> **get**(`key`): `any`

Defined in: [DataBase.ts:172](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L172)

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

Defined in: [DataBase.ts:186](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L186)

#### Returns

`string`[]

#### Overrides

[`DataBase`](DataBase.md).[`keys`](DataBase.md#keys)

***

### rm()

> **rm**(`key`): `void`

Defined in: [DataBase.ts:181](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L181)

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

Defined in: [DataBase.ts:165](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L165)

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

### clearAllDP()

> `static` **clearAllDP**(): `void`

Defined in: [DataBase.ts:19](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L19)

#### Returns

`void`

#### Inherited from

[`DataBase`](DataBase.md).[`clearAllDP`](DataBase.md#clearalldp)

***

### getAllKeys()

> `static` **getAllKeys**(): `string`[]

Defined in: [DataBase.ts:25](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L25)

#### Returns

`string`[]

#### Inherited from

[`DataBase`](DataBase.md).[`getAllKeys`](DataBase.md#getallkeys)

***

### getByteCount()

> `static` **getByteCount**(): `number`

Defined in: [DataBase.ts:22](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L22)

#### Returns

`number`

#### Inherited from

[`DataBase`](DataBase.md).[`getByteCount`](DataBase.md#getbytecount)

***

### getDB()

> `static` **getDB**(`name`): `undefined` \| [`DataBase`](DataBase.md)\<`any`\>

Defined in: [DataBase.ts:28](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L28)

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

Defined in: [DataBase.ts:31](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L31)

#### Returns

[`DataBase`](DataBase.md)\<`any`\>[]

#### Inherited from

[`DataBase`](DataBase.md).[`getDBs`](DataBase.md#getdbs)
