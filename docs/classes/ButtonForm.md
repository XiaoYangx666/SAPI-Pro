[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / ButtonForm

# Class: ButtonForm\<U\>

通用按钮表单

## Type Parameters

### U

`U` *extends* [`ButtonFormArgs`](../interfaces/ButtonFormArgs.md)

## Implements

- [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`, `U`\>

## Constructors

### Constructor

> **new ButtonForm**\<`U`\>(`data`): `ButtonForm`\<`U`\>

#### Parameters

##### data

[`ButtonFormData`](../interfaces/ButtonFormData.md)\<`U`\>

#### Returns

`ButtonForm`\<`U`\>

## Methods

### beforeBuild()

> **beforeBuild**(`ctx`): `Promise`\<`void`\>

在展示前运行，可用来处理验证或跳转

#### Parameters

##### ctx

[`SAPIProFormContext`](SAPIProFormContext.md)\<`ActionFormData`, `U`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

`SAPIProForm.beforeBuild`

***

### builder()

> **builder**(`player`, `args`): `Promise`\<`ActionFormData`\>

构建函数

#### Parameters

##### player

`Player`

##### args

`U`

#### Returns

`Promise`\<`ActionFormData`\>

#### Implementation of

`SAPIProForm.builder`

***

### handler()

> **handler**(`res`, `context`): `Promise`\<`void`\>

处理函数

#### Parameters

##### res

`ActionFormResponse`

##### context

[`SAPIProFormContext`](SAPIProFormContext.md)\<`ActionFormData`, `U`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

`SAPIProForm.handler`
