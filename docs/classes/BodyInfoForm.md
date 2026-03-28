[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / BodyInfoForm

# Class: BodyInfoForm\<U\>

## Type Parameters

### U

`U` *extends* [`contextArgs`](../interfaces/contextArgs.md)

## Implements

- [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`, `U`\>

## Constructors

### Constructor

> **new BodyInfoForm**\<`U`\>(`title`, `body`, `onSubmit?`): `BodyInfoForm`\<`U`\>

#### Parameters

##### title

[`TextType`](../type-aliases/TextType.md)

##### body

[`TextType`](../type-aliases/TextType.md) \| [`formGenerator`](../interfaces/formGenerator.md)\<`ActionFormData`, `U`\>

##### onSubmit?

(`ctx`) => `void`

#### Returns

`BodyInfoForm`\<`U`\>

## Methods

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

> **handler**(`res`, `ctx`): `Promise`\<`void`\>

处理函数

#### Parameters

##### res

`ActionFormResponse`

##### ctx

[`SAPIProFormContext`](SAPIProFormContext.md)\<`ActionFormData`, `U`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

`SAPIProForm.handler`
