[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / SAPIProFormContext

# Class: SAPIProFormContext\<T\>

## Type Parameters

• **T** *extends* [`formDataType`](../type-aliases/formDataType.md)

## Constructors

### new SAPIProFormContext()

> **new SAPIProFormContext**\<`T`\>(`args`, `stack`, `form`?): [`SAPIProFormContext`](SAPIProFormContext.md)\<`T`\>

#### Parameters

##### args

[`contextArgs`](../interfaces/contextArgs.md)

##### stack

`PlayerFormStack`

##### form?

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`T`\>

#### Returns

[`SAPIProFormContext`](SAPIProFormContext.md)\<`T`\>

## Properties

### \_form?

> `optional` **\_form**: [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`T`\>

**`Internal`**

内部属性，勿改

***

### args

> `readonly` **args**: [`contextArgs`](../interfaces/contextArgs.md)

***

### willBuild

> **willBuild**: `boolean`

**`Internal`**

内部属性，勿改

## Accessors

### player

#### Get Signature

> **get** **player**(): `Player`

##### Returns

`Player`

## Methods

### back()

> **back**(`delay`): `void`

返回上一个表单

#### Parameters

##### delay

`number` = `0`

#### Returns

`void`

***

### close()

> **close**(): `void`

关闭所有表单

#### Returns

`void`

***

### offAll()

> **offAll**\<`T`\>(`form`, `args`?, `delay`?): `void`

清空堆栈，并打开表单

#### Type Parameters

• **T** *extends* [`formDataType`](../type-aliases/formDataType.md)

#### Parameters

##### form

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`T`\>

##### args?

[`contextArgs`](../interfaces/contextArgs.md)

##### delay?

`number` = `0`

#### Returns

`void`

***

### offAllNamed()

> **offAllNamed**(`name`, `args`?, `delay`?): `void`

清空堆栈，并打开命名表单

#### Parameters

##### name

`string`

##### args?

[`contextArgs`](../interfaces/contextArgs.md)

##### delay?

`number` = `0`

#### Returns

`void`

***

### push()

> **push**\<`T`\>(`form`, `args`?, `delay`?): `void`

打开表单

#### Type Parameters

• **T** *extends* [`formDataType`](../type-aliases/formDataType.md)

#### Parameters

##### form

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`T`\>

##### args?

[`contextArgs`](../interfaces/contextArgs.md)

##### delay?

`number` = `0`

#### Returns

`void`

***

### pushNamed()

> **pushNamed**(`name`, `args`?, `delay`?): `void`

打开命名表单

#### Parameters

##### name

`string`

##### args?

[`contextArgs`](../interfaces/contextArgs.md)

##### delay?

`number` = `0`

#### Returns

`void`

***

### reopen()

> **reopen**(`delay`): `void`

重新打开当前表单

#### Parameters

##### delay

`number` = `0`

#### Returns

`void`

***

### replace()

> **replace**\<`T`\>(`form`, `args`?, `delay`?): `void`

替换当前表单为新的命名表单

#### Type Parameters

• **T** *extends* [`formDataType`](../type-aliases/formDataType.md)

#### Parameters

##### form

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`T`\>

##### args?

[`contextArgs`](../interfaces/contextArgs.md)

##### delay?

`number` = `0`

#### Returns

`void`

***

### replaceNamed()

> **replaceNamed**(`name`, `args`?, `delay`?): `void`

替换当前表单为新的命名表单

#### Parameters

##### name

`string`

##### args?

[`contextArgs`](../interfaces/contextArgs.md)

##### delay?

`number` = `0`

#### Returns

`void`
