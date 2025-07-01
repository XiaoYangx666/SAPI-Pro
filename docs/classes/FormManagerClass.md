[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / FormManagerClass

# Class: FormManagerClass

## Constructors

### new FormManagerClass()

> **new FormManagerClass**(): [`FormManagerClass`](FormManagerClass.md)

#### Returns

[`FormManagerClass`](FormManagerClass.md)

## Methods

### \_bind()

> **\_bind**(): `void`

**`Internal`**

不要调用，不要调用，不要调用

#### Returns

`void`

***

### \_show()

> **\_show**(`player`, `delay`): `void`

**`Internal`**

显示form
 不要调用

#### Parameters

##### player

`Player`

##### delay

`number` = `0`

#### Returns

`void`

***

### \_showNamed()

> **\_showNamed**(`player`, `name`, `delay`): `void`

**`Internal`**

显示具名form
 不要调用

#### Parameters

##### player

`Player`

##### name

`string`

##### delay

`number` = `0`

#### Returns

`void`

***

### getForm()

> **getForm**(`name`): [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`any`\>

获取指定名字的form

#### Parameters

##### name

`string`

#### Returns

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`any`\>

#### Throws

如果没有找到

***

### open()

> **open**\<`T`\>(`player`, `form`, `args`?, `delay`?): `void`

为玩家打开表单

#### Type Parameters

• **T** *extends* [`formDataType`](../type-aliases/formDataType.md)

#### Parameters

##### player

`Player`

玩家

##### form

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`T`\>

表单实例

##### args?

[`contextArgs`](../interfaces/contextArgs.md)

初始参数

##### delay?

`number` = `0`

延迟(游戏刻)

#### Returns

`void`

***

### openExternal()

> **openExternal**(`player`, `nameSpace`, `name`, `args`?, `delay`?): `void`

打开外部表单

#### Parameters

##### player

`Player`

玩家

##### nameSpace

`string`

包命名空间

##### name

`string`

表单名

##### args?

[`contextArgs`](../interfaces/contextArgs.md)

初始参数

##### delay?

`number` = `0`

延迟(游戏刻)

#### Returns

`void`

***

### openNamed()

> **openNamed**(`player`, `name`, `args`?, `delay`?): `void`

打开指定名字的表单，需要先注册

#### Parameters

##### player

`Player`

玩家

##### name

`string`

表单名

##### args?

[`contextArgs`](../interfaces/contextArgs.md)

初始参数

##### delay?

`number` = `0`

延迟(游戏刻)

#### Returns

`void`

***

### registerAll()

> **registerAll**(`forms`): `void`

注册一堆表单

#### Parameters

##### forms

`SAPIProFormBatchRegister`

#### Returns

`void`

***

### registerNamed()

> **registerNamed**\<`T`\>(`name`, `form`): `void`

注册一个具名表单

#### Type Parameters

• **T** *extends* [`formDataType`](../type-aliases/formDataType.md)

#### Parameters

##### name

`string`

##### form

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`T`\>

#### Returns

`void`
