[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / SimpleMessageForm

# Class: SimpleMessageForm\<U\>

## Type Parameters

### U

`U` *extends* [`contextArgs`](../interfaces/contextArgs.md)

## Implements

- [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`MessageFormData`, `U`\>

## Constructors

### Constructor

> **new SimpleMessageForm**\<`U`\>(`data`): `SimpleMessageForm`\<`U`\>

#### Parameters

##### data

[`SimpleMessageFormData`](../interfaces/SimpleMessageFormData.md)\<`U`\>

#### Returns

`SimpleMessageForm`\<`U`\>

## Methods

### builder()

> **builder**(`player`, `args`): `Promise`\<`MessageFormData`\>

构建函数

#### Parameters

##### player

`Player`

##### args

`U`

#### Returns

`Promise`\<`MessageFormData`\>

#### Implementation of

`SAPIProForm.builder`

***

### handler()

> **handler**(`res`, `ctx`): `Promise`\<`void`\>

处理函数

#### Parameters

##### res

`MessageFormResponse`

##### ctx

[`SAPIProFormContext`](SAPIProFormContext.md)\<`MessageFormData`, `U`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

`SAPIProForm.handler`
