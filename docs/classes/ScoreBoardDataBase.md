[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / ScoreBoardDataBase

# Class: ScoreBoardDataBase

## Extends

- [`DataBase`](DataBase.md)\<`number`\>

## Constructors

### Constructor

> **new ScoreBoardDataBase**(`name`, `displayName?`, `usePrefix?`): `ScoreBoardDataBase`

#### Parameters

##### name

`string`

##### displayName?

`string`

##### usePrefix?

`boolean` = `true`

#### Returns

`ScoreBoardDataBase`

#### Overrides

[`DataBase`](DataBase.md).[`constructor`](DataBase.md#constructor)

## Properties

### name

> **name**: `string`

#### Inherited from

[`DataBase`](DataBase.md).[`name`](DataBase.md#name)

***

### type

> **type**: `"DP"` \| `"jSB"` \| `"cSB"` \| `undefined`

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

### add()

> **add**(`key`, `value`): `void`

#### Parameters

##### key

`string` | `Player`

##### value

`string` | `number`

#### Returns

`void`

***

### clear()

> **clear**(): `void`

清空计分板(删除并重建)

#### Returns

`void`

#### Overrides

[`DataBase`](DataBase.md).[`clear`](DataBase.md#clear)

***

### dispose()

> **dispose**(): `void`

删除这个scoreboard(下次用到会重建)

#### Returns

`void`

***

### get()

> **get**(`key`): `number` \| `undefined`

#### Parameters

##### key

`string` | `Player`

#### Returns

`number` \| `undefined`

#### Overrides

[`DataBase`](DataBase.md).[`get`](DataBase.md#get)

***

### getObj()

> **getObj**(`key`): [`scoreboardObj`](scoreboardObj.md)

获取一个虚拟计分项对象

#### Parameters

##### key

`string` | `Player`

#### Returns

[`scoreboardObj`](scoreboardObj.md)

***

### getScoreBoard()

> **getScoreBoard**(): `ScoreboardObjective`

#### Returns

`ScoreboardObjective`

***

### getScoreBoardName()

> **getScoreBoardName**(): `string`

#### Returns

`string`

***

### isDisplayAtSlot()

> **isDisplayAtSlot**(`DisplaySlotId`): `boolean`

判断是否在正在指定Slot显示

#### Parameters

##### DisplaySlotId

`DisplaySlotId`

#### Returns

`boolean`

***

### keys()

> **keys**(): `string`[]

获取所有计分项

#### Returns

`string`[]

#### Overrides

[`DataBase`](DataBase.md).[`keys`](DataBase.md#keys)

***

### resetAll()

> **resetAll**(): `void`

重置所有积分项

#### Returns

`void`

***

### rm()

> **rm**(`key`): `void`

删除指定计分项

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

### setDisplaySlot()

> **setDisplaySlot**(`SlotId`): `void`

设置显示位置

#### Parameters

##### SlotId

`DisplaySlotId`

#### Returns

`void`

***

### getDB()

> `static` **getDB**(`name`): [`DataBase`](DataBase.md)\<`any`\> \| `undefined`

#### Parameters

##### name

`string`

#### Returns

[`DataBase`](DataBase.md)\<`any`\> \| `undefined`

#### Inherited from

[`DataBase`](DataBase.md).[`getDB`](DataBase.md#getdb)

***

### getDBs()

> `static` **getDBs**(): [`DataBase`](DataBase.md)\<`any`\>[]

#### Returns

[`DataBase`](DataBase.md)\<`any`\>[]

#### Inherited from

[`DataBase`](DataBase.md).[`getDBs`](DataBase.md#getdbs)
