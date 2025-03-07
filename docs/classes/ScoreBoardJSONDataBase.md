[**Documentation**](../README.md)

---

[Documentation](../globals.md) / ScoreBoardJSONDataBase

# Class: ScoreBoardJSONDataBase

JSON 计分板数据库

## Extends

-   [`DataBase`](DataBase.md)\<`object`\>

## Constructors

### new ScoreBoardJSONDataBase()

> **new ScoreBoardJSONDataBase**(`name`): [`ScoreBoardJSONDataBase`](ScoreBoardJSONDataBase.md)

#### Parameters

##### name

`string`

#### Returns

[`ScoreBoardJSONDataBase`](ScoreBoardJSONDataBase.md)

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

### edit()

> **edit**(`callback`): `void`

#### Parameters

##### callback

(`data`) => `undefined` \| `boolean` \| `void`

#### Returns

`void`

---

### get()

> **get**(`key`): `any`

#### Parameters

##### key

`string`

#### Returns

`any`

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

`string`

#### Returns

`void`

---

### set()

> **set**(`key`, `value`): `void`

#### Parameters

##### key

`string`

##### value

`object`

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

### getByteCount()

> `static` **getByteCount**(): `number`

#### Returns

`number`

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
