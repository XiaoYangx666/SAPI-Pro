[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / ConfigFormOptions

# Interface: ConfigFormOptions\<T, U\>

## Type Parameters

### T

`T` *extends* `Record`\<`string`, [`AnyConfig`](../type-aliases/AnyConfig.md)\<`U`\>\>

### U

`U` *extends* [`InputFormArgs`](InputFormArgs.md)

## Properties

### initialValues?

> `optional` **initialValues?**: `Dynamic`\<`Partial`\<\{ \[K in string \| number \| symbol\]: \_InferResult\<T, U\>\[K\] \}\>, `U`\>

***

### onCancel?

> `optional` **onCancel?**: (`player`, `ctx`) => `void` \| `Promise`\<`void`\>

#### Parameters

##### player

`Player`

##### ctx

[`SAPIProFormContext`](../classes/SAPIProFormContext.md)\<`ModalFormData`, `U`\>

#### Returns

`void` \| `Promise`\<`void`\>

***

### onSubmit?

> `optional` **onSubmit?**: (`result`, `player`, `ctx`) => `void` \| `Promise`\<`void`\>

#### Parameters

##### result

\{ \[K in string \| number \| symbol\]: \_InferResult\<T, U\>\[K\] \}

##### player

`Player`

##### ctx

[`SAPIProFormContext`](../classes/SAPIProFormContext.md)\<`ModalFormData`, `U`\>

#### Returns

`void` \| `Promise`\<`void`\>

***

### submitButton?

> `optional` **submitButton?**: `Dynamic`\<[`TextType`](../type-aliases/TextType.md) \| `undefined`, `U`\>

***

### title

> **title**: `Dynamic`\<[`TextType`](../type-aliases/TextType.md), `U`\>
