[**Documentation**](../README.md)

---

[Documentation](../globals.md) / DPDataBase

# Class: DPDataBase

## Extends

-   [`DataBase`](DataBase.md)\<`DPTypes`\>

## Constructors

### new DPDataBase()

> **new DPDataBase**(`name`): [`DPDataBase`](DPDataBase.md)

#### Parameters

##### name

`string`

#### Returns

[`DPDataBase`](DPDataBase.md)

## Properties

### name

> **name**: `string`

数据库名

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

清空数据库键值

#### Returns

`void`

---

### get()

> **get**(`key`): `undefined` \| `string` \| `number` \| `boolean` \| `Vector3`

获取数据库某个键

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `string` \| `number` \| `boolean` \| `Vector3`

---

### getJSON()

> **getJSON**(`key`): `undefined` \| `object`

获取 json 形式存储的对象

#### Parameters

##### key

`string`

#### Returns

`undefined` \| `object`

---

### getrealKeys()

> **getrealKeys**(): `string`[]

#### Returns

`string`[]

---

### keys()

> **keys**(): `string`[]

获取所有键

#### Returns

`string`[]

---

### rm()

> **rm**(`key`): `void`

删除指定键

#### Parameters

##### key

`string`

#### Returns

`void`

---

### set()

> **set**(`key`, `value`): `void`

设置数据库键值

#### Parameters

##### key

`string`

##### value

`DPTypes`

#### Returns

`void`

---

### setJSON()

> **setJSON**(`key`, `value`): `void`

以 json 形式存储一个对象

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

---

### isDPDataBase()

> `static` **isDPDataBase**(`db`): `db is DPDataBase`

#### Parameters

##### db

[`DataBase`](DataBase.md)\<`any`\>

#### Returns

`db is DPDataBase`
