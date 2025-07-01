[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / SimpleMessageFormData

# Interface: SimpleMessageFormData

## Properties

### body?

> `optional` **body**: `string`

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

> **handler**: [`formHandler`](../type-aliases/formHandler.md)\<`MessageFormData`\>

***

### title?

> `optional` **title**: `string`
