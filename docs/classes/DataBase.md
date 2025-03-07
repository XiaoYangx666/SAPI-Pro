[**Documentation**](../README.md)

---

[Documentation](../globals.md) / DataBase

# Class: `abstract` DataBase\<T\>

此为数据库基类，要存储请使用子类

## Extended by

-   [ScoreBoardDataBase](ScoreBoardDataBase.md)
-   [DPDataBase](DPDataBase.md)
-   [ScoreBoardJSONDataBase](ScoreBoardJSONDataBase.md)

## Type Parameters

• **T**

## Constructors

### new DataBase()

> **new DataBase**\<`T`\>(`name`): [`DataBase`](DataBase.md)\<`T`\>

#### Parameters

##### name

`string`

#### Returns

[`DataBase`](DataBase.md)\<`T`\>

## Properties

### name

> **name**: `string`

---

### type

> **type**: `undefined` \| `"DP"` \| `"jSB"` \| `"cSB"`

---

### DBMap

> `static` **DBMap**: `Record`\<`string`, [`DataBase`](DataBase.md)\<`any`\>\> = `{}`

最大单个存储

---

### maxChunkBytes

> `static` **maxChunkBytes**: `number` = `32767`

## Methods

### clear()

> `abstract` **clear**(): `void`

#### Returns

`void`

---

### get()

> `abstract` **get**(`key`): `undefined` \| `T`

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `T`

---

### keys()

> `abstract` **keys**(): `string`[]

#### Returns

`string`[]

---

### rm()

> `abstract` **rm**(`key`): `void`

#### Parameters

##### key

`string`

#### Returns

`void`

---

### set()

> `abstract` **set**(`key`, `value`): `void`

#### Parameters

##### key

`string`

##### value

`T`

#### Returns

`void`

---

### clearAllDP()

> `static` **clearAllDP**(): `void`

清空所有动态数据

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

获取 DP 占用的总存储空间

#### Returns

`number`

---

### getDB()

> `static` **getDB**(`name`): `undefined` \| [`DataBase`](DataBase.md)\<`any`\>

获取指定名称的数据库

#### Parameters

##### name

`string`

#### Returns

`undefined` \| [`DataBase`](DataBase.md)\<`any`\>

---

### getDBs()

> `static` **getDBs**(): [`DataBase`](DataBase.md)\<`any`\>[]

获取所有数据库

#### Returns

[`DataBase`](DataBase.md)\<`any`\>[]
