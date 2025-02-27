[**Documentation**](../README.md)

***

[Documentation](../globals.md) / ScoreBoardDataBase

# Class: ScoreBoardDataBase

Defined in: DataBase.ts:282

## Extends

- [`DataBase`](DataBase.md)\<`number`\>

## Constructors

### new ScoreBoardDataBase()

> **new ScoreBoardDataBase**(`name`): [`ScoreBoardDataBase`](ScoreBoardDataBase.md)

Defined in: DataBase.ts:285

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

Defined in: DataBase.ts:319

#### Returns

`void`

#### Overrides

[`DataBase`](DataBase.md).[`clear`](DataBase.md#clear)

***

### get()

> **get**(`key`): `undefined` \| `number`

Defined in: DataBase.ts:302

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

Defined in: DataBase.ts:308

获取一个虚拟计分项对象

#### Parameters

##### key

`string` | `Player`

#### Returns

`scoreboardObj`

***

### keys()

> **keys**(): `string`[]

Defined in: DataBase.ts:314

#### Returns

`string`[]

#### Overrides

[`DataBase`](DataBase.md).[`keys`](DataBase.md#keys)

***

### rm()

> **rm**(`key`): `void`

Defined in: DataBase.ts:311

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

Defined in: DataBase.ts:298

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
