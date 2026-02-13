[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / RandomUtils

# Class: RandomUtils

## Constructors

### Constructor

> **new RandomUtils**(): `RandomUtils`

#### Returns

`RandomUtils`

## Methods

### bool()

> `static` **bool**(): `boolean`

随机布尔值（true/false）

#### Returns

`boolean`

***

### choice()

> `static` **choice**\<`T`\>(`arr`): `T` \| `undefined`

从数组中随机取一个元素

#### Type Parameters

##### T

`T`

#### Parameters

##### arr

`T`[]

#### Returns

`T` \| `undefined`

***

### choices()

> `static` **choices**\<`T`\>(`arr`, `count`): `T`[]

从数组中随机取多个不重复元素(洗牌算法)

#### Type Parameters

##### T

`T`

#### Parameters

##### arr

`T`[]

##### count

`number`

#### Returns

`T`[]

***

### int()

> `static` **int**(`max`): `number`

返回 [0, max) 的随机整数

#### Parameters

##### max

`number`

#### Returns

`number`

***

### intRange()

> `static` **intRange**(`min`, `max`): `number`

返回 [min, max) 的随机整数

#### Parameters

##### min

`number`

##### max

`number`

#### Returns

`number`

***

### shuffle()

> `static` **shuffle**\<`T`\>(`arr`): `T`[]

纯洗牌算法，返回一个新数组（Fisher–Yates Shuffle）

#### Type Parameters

##### T

`T`

#### Parameters

##### arr

`T`[]

#### Returns

`T`[]

***

### shuffleInPlace()

> `static` **shuffleInPlace**\<`T`\>(`arr`): `void`

就地洗牌（直接修改原数组）

#### Type Parameters

##### T

`T`

#### Parameters

##### arr

`T`[]

#### Returns

`void`
