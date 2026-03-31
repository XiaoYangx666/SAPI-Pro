[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / ConfigForm

# Class: ConfigForm\<T, U\>

ConfigForm 实现

## Type Parameters

### T

`T` *extends* `Record`\<`string`, [`AnyConfig`](../type-aliases/AnyConfig.md)\<`U`\>\>

### U

`U` *extends* [`InputFormArgs`](../interfaces/InputFormArgs.md)

## Implements

- [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ModalFormData`, `U`\>

## Constructors

### Constructor

> **new ConfigForm**\<`T`, `U`\>(`schema`, `options`): `ConfigForm`\<`T`, `U`\>

#### Parameters

##### schema

`T`

##### options

[`ConfigFormOptions`](../interfaces/ConfigFormOptions.md)\<`T`, `U`\>

#### Returns

`ConfigForm`\<`T`, `U`\>

## Methods

### builder()

> **builder**(`player`, `args`): `ModalFormData`

构建函数

#### Parameters

##### player

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
