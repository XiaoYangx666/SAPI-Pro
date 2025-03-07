[**Documentation**](../README.md)

---

[Documentation](../globals.md) / ScoreBoardDataBase

# Class: ScoreBoardDataBase

计分板数据库

## Extends

-   [`DataBase`](DataBase.md)\<`number`\>

## Constructors

### new ScoreBoardDataBase()

> **new ScoreBoardDataBase**(`name`): [`ScoreBoardDataBase`](ScoreBoardDataBase.md)

#### Parameters

##### name

`string`

#### Returns

[`ScoreBoardDataBase`](ScoreBoardDataBase.md)

## Properties

### name

> **name**: `string`

---

### type

> **type**: `undefined` \| `"DP"` \| `"jSB"` \| `"cSB"`

---

### DBMap

> `static` **DBMap**: `Record`\<`string`, [`DataBase`](DataBase.md)\<`any`\>\> = `{}`

---

### maxChunkBytes

> `static` **maxChunkBytes**: `number` = `32767`

## Methods

### clear()

> **clear**(): `void`

#### Returns

`void`

---

### get()

> **get**(`key`): `undefined` \| `number`

#### Parameters

##### key

`string` | `Player`

#### Returns

`undefined` \| `number`

---

### getObj()

> **getObj**(`key`): `scoreboardObj`

获取一个虚拟计分项对象

#### Parameters

##### key

`string` | `Player`

#### Returns

`scoreboardObj`

---

### keys()

> **keys**(): `string`[]

#### Returns

`string`[]

---

### rm()

> **rm**(`key`): `void`

#### Parameters

##### key

`string` | `Player`

#### Returns

`void`

---

### set()

> **set**(`key`, `value`): `void`

#### Parameters

##### key

`string` | `Player`

##### value

`string` | `number`

#### Returns

`void`

---

### clearAllDP()

> `static` **clearAllDP**(): `void`

#### Returns

`void`

---

### getAllKeys()

> `static` **getAllKeys**(): `string`[]

#### Returns

`string`[]

---

### getDB()

> `static` **getDB**(`name`): `undefined` \| [`DataBase`](DataBase.md)\<`any`\>

#### Parameters

##### name

`string`

#### Returns

`undefined` \| [`DataBase`](DataBase.md)\<`any`\>

---

### getDBs()

> `static` **getDBs**(): [`DataBase`](DataBase.md)\<`any`\>[]

#### Returns

[`DataBase`](DataBase.md)\<`any`\>[]
