[**Documentation**](../README.md)

***

[Documentation](../globals.md) / ScoreBoardDataBase

# Class: ScoreBoardDataBase

Defined in: [DataBase.ts:282](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L282)

## Extends

- [`DataBase`](DataBase.md)\<`number`\>

## Constructors

### new ScoreBoardDataBase()

> **new ScoreBoardDataBase**(`name`): [`ScoreBoardDataBase`](ScoreBoardDataBase.md)

Defined in: [DataBase.ts:285](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L285)

#### Parameters

##### name

`string`

#### Returns

[`ScoreBoardDataBase`](ScoreBoardDataBase.md)

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

Defined in: [DataBase.ts:319](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L319)

#### Returns

`void`

#### Overrides

[`DataBase`](DataBase.md).[`clear`](DataBase.md#clear)

***

### get()

> **get**(`key`): `undefined` \| `number`

Defined in: [DataBase.ts:302](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L302)

#### Parameters

##### key

`string` | `Player`

#### Returns

`undefined` \| `number`

#### Overrides

[`DataBase`](DataBase.md).[`get`](DataBase.md#get)

***

### getObj()

> **getObj**(`key`): `scoreboardObj`

Defined in: [DataBase.ts:308](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L308)

获取一个虚拟计分项对象

#### Parameters

##### key

`string` | `Player`

#### Returns

`scoreboardObj`

***

### keys()

> **keys**(): `string`[]

Defined in: [DataBase.ts:314](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L314)

#### Returns

`string`[]

#### Overrides

[`DataBase`](DataBase.md).[`keys`](DataBase.md#keys)

***

### rm()

> **rm**(`key`): `void`

Defined in: [DataBase.ts:311](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L311)

#### Parameters

##### key

`string` | `Player`

#### Returns

`void`

#### Overrides

[`DataBase`](DataBase.md).[`rm`](DataBase.md#rm)

***

### set()

> **set**(`key`, `value`): `void`

Defined in: [DataBase.ts:298](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L298)

#### Parameters

##### key

`string` | `Player`

##### value

`string` | `number`

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
