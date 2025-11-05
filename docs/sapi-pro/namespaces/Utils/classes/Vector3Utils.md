[**sapi-pro**](../../../../README.md)

***

[sapi-pro](../../../../globals.md) / [Utils](../README.md) / Vector3Utils

# Class: Vector3Utils

向量工具类，提供向量相关的操作方法

## Constructors

### Constructor

> **new Vector3Utils**(): `Vector3Utils`

#### Returns

`Vector3Utils`

## Methods

### above()

> `static` **above**(`v`, `step`): `Vector3`

返回上方指定距离(默认1)的Vector

#### Parameters

##### v

`Vector3`

##### step

`number` = `1`

#### Returns

`Vector3`

***

### add()

> `static` **add**(`v1`, `v2`): `Vector3`

v1+v2

#### Parameters

##### v1

`Vector3`

##### v2

`Vector3`

#### Returns

`Vector3`

***

### below()

> `static` **below**(`v`, `step`): `Vector3`

返回下方指定距离(默认1)的Vector

#### Parameters

##### v

`Vector3`

##### step

`number` = `1`

#### Returns

`Vector3`

***

### cross()

> `static` **cross**(`v1`, `v2`): `object`

叉积

#### Parameters

##### v1

`Vector3`

##### v2

`Vector3`

#### Returns

`object`

##### x

> **x**: `number`

##### y

> **y**: `number`

##### z

> **z**: `number`

***

### distance()

> `static` **distance**(`v1`, `v2`): `number`

距离

#### Parameters

##### v1

`Vector3`

##### v2

`Vector3`

#### Returns

`number`

***

### dot()

> `static` **dot**(`v1`, `v2`): `number`

点积

#### Parameters

##### v1

`Vector3`

##### v2

`Vector3`

#### Returns

`number`

***

### fromArray()

> `static` **fromArray**(`array`): `Vector3`

将数组转为Vector3

#### Parameters

##### array

`number`[]

#### Returns

`Vector3`

***

### intLoc()

> `static` **intLoc**(`v`): `object`

小数坐标转为整数坐标

#### Parameters

##### v

`Vector3`

#### Returns

`object`

##### x

> **x**: `number`

##### y

> **y**: `number`

##### z

> **z**: `number`

***

### isApproxEqual()

> `static` **isApproxEqual**(`v1`, `v2`, `eps`): `boolean`

v1与v2在误差eps范围内相等?

#### Parameters

##### v1

`Vector3`

##### v2

`Vector3`

##### eps

`number` = `1e-6`

#### Returns

`boolean`

***

### isEqual()

> `static` **isEqual**(`v1`, `v2`): `boolean`

v1==v2?

#### Parameters

##### v1

`Vector3`

##### v2

`Vector3`

#### Returns

`boolean`

***

### length()

> `static` **length**(`v`): `number`

向量长度

#### Parameters

##### v

`Vector3`

#### Returns

`number`

***

### normalize()

> `static` **normalize**(`v`): `object`

归一化向量

#### Parameters

##### v

`Vector3`

#### Returns

`object`

##### x

> **x**: `number` = `0`

##### y

> **y**: `number` = `0`

##### z

> **z**: `number` = `0`

***

### scale()

> `static` **scale**(`v`, `times`): `object`

v1*n

#### Parameters

##### v

`Vector3`

##### times

`number`

#### Returns

`object`

##### x

> **x**: `number`

##### y

> **y**: `number`

##### z

> **z**: `number`

***

### squaredDistance()

> `static` **squaredDistance**(`v1`, `v2`): `number`

距离(不开根号)

#### Parameters

##### v1

`Vector3`

##### v2

`Vector3`

#### Returns

`number`

***

### subtract()

> `static` **subtract**(`v1`, `v2`): `Vector3`

v1-v2

#### Parameters

##### v1

`Vector3`

##### v2

`Vector3`

#### Returns

`Vector3`

***

### toArray()

> `static` **toArray**(`vector`): \[`number`, `number`, `number`\]

将Vector3转为数组

#### Parameters

##### vector

`Vector3`

#### Returns

\[`number`, `number`, `number`\]

***

### toString()

> `static` **toString**(`vector`): `string`

转为字符串

#### Parameters

##### vector

`Vector3`

#### Returns

`string`
