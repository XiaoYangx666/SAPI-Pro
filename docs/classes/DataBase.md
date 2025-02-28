[**Documentation**](../README.md)

***

[Documentation](../globals.md) / DataBase

# Class: `abstract` DataBase\<T\>

Defined in: [DataBase.ts:5](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L5)

## Extended by

- [`ScoreBoardDataBase`](ScoreBoardDataBase.md)
- [`DPDataBase`](DPDataBase.md)
- [`ScoreBoardJSONDataBase`](ScoreBoardJSONDataBase.md)

## Type Parameters

• **T**

## Constructors

### new DataBase()

> **new DataBase**\<`T`\>(`name`): [`DataBase`](DataBase.md)\<`T`\>

Defined in: [DataBase.ts:10](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L10)

#### Parameters

##### name

`string`

#### Returns

[`DataBase`](DataBase.md)\<`T`\>

## Properties

### name

> **name**: `string`

Defined in: [DataBase.ts:8](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L8)

***

### type

> **type**: `undefined` \| `"DP"` \| `"jSB"` \| `"cSB"`

Defined in: [DataBase.ts:9](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L9)

***

### DBMap

> `static` **DBMap**: `Record`\<`string`, [`DataBase`](DataBase.md)\<`any`\>\> = `{}`

Defined in: [DataBase.ts:7](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L7)

***

### maxChunkBytes

> `static` **maxChunkBytes**: `number` = `32767`

Defined in: [DataBase.ts:6](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L6)

## Methods

### clear()

> `abstract` **clear**(): `void`

Defined in: [DataBase.ts:18](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L18)

#### Returns

`void`

***

### get()

> `abstract` **get**(`key`): `undefined` \| `T`

Defined in: [DataBase.ts:15](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L15)

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `T`

***

### keys()

> `abstract` **keys**(): `string`[]

Defined in: [DataBase.ts:17](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L17)

#### Returns

`string`[]

***

### rm()

> `abstract` **rm**(`key`): `void`

Defined in: [DataBase.ts:16](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L16)

#### Parameters

##### key

`string`

#### Returns

`void`

***

### set()

> `abstract` **set**(`key`, `value`): `void`

Defined in: [DataBase.ts:14](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L14)

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

Defined in: [DataBase.ts:19](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L19)

#### Returns

`void`

***

### getAllKeys()

> `static` **getAllKeys**(): `string`[]

Defined in: [DataBase.ts:25](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L25)

#### Returns

`string`[]

***

### getByteCount()

> `static` **getByteCount**(): `number`

Defined in: [DataBase.ts:22](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L22)

#### Returns

`number`

***

### getDB()

> `static` **getDB**(`name`): `undefined` \| [`DataBase`](DataBase.md)\<`any`\>

Defined in: [DataBase.ts:28](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L28)

#### Parameters

##### name

`string`

#### Returns

`undefined` \| [`DataBase`](DataBase.md)\<`any`\>

***

### getDBs()

> `static` **getDBs**(): [`DataBase`](DataBase.md)\<`any`\>[]

Defined in: [DataBase.ts:31](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/DataBase.ts#L31)

#### Returns

[`DataBase`](DataBase.md)\<`any`\>[]
