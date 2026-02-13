[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / NameDB

# Class: NameDB

一个用于存储玩家名字的存储库

## Constructors

### Constructor

> **new NameDB**(`options?`): `NameDB`

#### Parameters

##### options?

[`NameDBOptions`](../interfaces/NameDBOptions.md)

#### Returns

`NameDB`

## Methods

### getIdByNameUnsafe()

> **getIdByNameUnsafe**(`playerName`): `string` \| `undefined`

#### Parameters

##### playerName

`string`

#### Returns

`string` \| `undefined`

***

### getNameById()

> **getNameById**(`playerId`): `string` \| `undefined`

根据玩家id获取名字

#### Parameters

##### playerId

`string`

玩家id

#### Returns

`string` \| `undefined`

***

### removeById()

> **removeById**(`playerId`): `void`

#### Parameters

##### playerId

`string`

#### Returns

`void`

***

### repairReverseIndex()

> **repairReverseIndex**(): `void`

#### Returns

`void`

***

### set()

> **set**(`player`): `void`

设置玩家的名字

#### Parameters

##### player

`Player`

#### Returns

`void`

***

### updateAll()

> **updateAll**(): `void`

更新所有在线玩家的名字

#### Returns

`void`
