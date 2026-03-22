[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / InputForm

# Class: InputForm\<U, TResult\>

## Type Parameters

### U

`U` *extends* [`InputFormArgs`](../interfaces/InputFormArgs.md)

### TResult

`TResult` = `any`

## Implements

- [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ModalFormData`, `U`\>

## Constructors

### Constructor

> **new InputForm**\<`U`, `TResult`\>(`data`): `InputForm`\<`U`, `TResult`\>

#### Parameters

##### data

[`InputFormData`](../interfaces/InputFormData.md)\<`U`, `TResult`\>

#### Returns

`InputForm`\<`U`, `TResult`\>

## Methods

### builder()

> **builder**(`p`, `args`): `ModalFormData`

构建函数

#### Parameters

##### p

`Player`

##### args

`U`

#### Returns

`ModalFormData`

#### Implementation of

`SAPIProForm.builder`

***

### handler()

> **handler**(`res`, `ctx`): `Promise`\<`void`\>

处理函数

#### Parameters

##### res

`ModalFormResponse`

##### ctx

[`SAPIProFormContext`](SAPIProFormContext.md)\<`ModalFormData`, `U`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

`SAPIProForm.handler`
