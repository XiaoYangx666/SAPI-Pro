[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / SimpleMessageFormData

# Interface: SimpleMessageFormData\<U\>

## Type Parameters

### U

`U` *extends* [`contextArgs`](contextArgs.md) = [`contextArgs`](contextArgs.md)

## Properties

### body?

> `optional` **body**: `string` \| [`LangText`](../type-aliases/LangText.md)

***

### button1?

> `optional` **button1**: `string`

***

### button2?

> `optional` **button2**: `string`

***

### generator()?

> `optional` **generator**: (`form`, `player`, `args`) => `void` \| `Promise`\<`void`\>

#### Parameters

##### form

`MessageFormData`

##### player

`Player`

##### args

[`contextArgs`](contextArgs.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### handler

> **handler**: [`formHandler`](../type-aliases/formHandler.md)\<`MessageFormData`, `U`\>

***

### title?

> `optional` **title**: `string` \| [`LangText`](../type-aliases/LangText.md)
