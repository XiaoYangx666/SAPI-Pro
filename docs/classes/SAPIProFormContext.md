[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / SAPIProFormContext

# Class: SAPIProFormContext\<T, U\>

## Type Parameters

### T

`T` *extends* [`formDataType`](../type-aliases/formDataType.md)

### U

`U` *extends* [`contextArgs`](../interfaces/contextArgs.md)

## Constructors

### Constructor

> **new SAPIProFormContext**\<`T`, `U`\>(`args`, `stack`, `form?`): `SAPIProFormContext`\<`T`, `U`\>

#### Parameters

##### args

`U`

##### stack

`PlayerFormStack`

##### form?

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`T`, `U`\>

#### Returns

`SAPIProFormContext`\<`T`, `U`\>

## Properties

### \_form?

> `optional` **\_form?**: [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`T`, `U`\>

**`Internal`**

内部属性，勿改

***

### args

> `readonly` **args**: `U`

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

> **back**(`delay?`): `void`

返回上一个表单

#### Parameters

##### delay?

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

> **offAll**\<`T`, `TArgs`\>(`form`, `args?`, `delay?`): `void`

清空堆栈，并打开表单

#### Type Parameters

##### T

`T` *extends* [`formDataType`](../type-aliases/formDataType.md)

##### TArgs

`TArgs` *extends* [`contextArgs`](../interfaces/contextArgs.md)

#### Parameters

##### form

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`T`, `TArgs`\>

##### args?

`TArgs`

##### delay?

`number` = `0`

#### Returns

`void`

***

### offAllNamed()

> **offAllNamed**(`name`, `args?`, `delay?`): `void`

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

> **push**\<`T`, `TArgs`\>(`form`, `args?`, `delay?`): `void`

打开表单

#### Type Parameters

##### T

`T` *extends* [`formDataType`](../type-aliases/formDataType.md)

##### TArgs

`TArgs` *extends* [`contextArgs`](../interfaces/contextArgs.md)

#### Parameters

##### form

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`T`, `TArgs`\>

##### args?

`TArgs`

##### delay?

`number` = `0`

#### Returns

`void`

***

### pushNamed()

> **pushNamed**(`name`, `args?`, `delay?`): `void`

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

> **reopen**(`delay?`): `void`

重新打开当前表单

#### Parameters

##### delay?

`number` = `0`

#### Returns

`void`

***

### replace()

> **replace**\<`T`, `TArgs`\>(`form`, `args?`, `delay?`): `void`

替换当前表单为新的命名表单

#### Type Parameters

##### T

`T` *extends* [`formDataType`](../type-aliases/formDataType.md)

##### TArgs

`TArgs` *extends* [`contextArgs`](../interfaces/contextArgs.md)

#### Parameters

##### form

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`T`, `TArgs`\>

##### args?

`TArgs`

##### delay?

`number` = `0`

#### Returns

`void`

***

### replaceNamed()

> **replaceNamed**(`name`, `args?`, `delay?`): `void`

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
