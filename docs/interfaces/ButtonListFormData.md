[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / ButtonListFormData

# Interface: ButtonListFormData\<U\>

## Type Parameters

### U

`U` *extends* [`contextArgs`](contextArgs.md) = [`contextArgs`](contextArgs.md)

## Properties

### body?

> `optional` **body**: `string` \| [`LangText`](../type-aliases/LangText.md)

***

### generator?

> `optional` **generator**: [`formGenerator`](formGenerator.md)\<`ActionFormData`, `U`\>

***

### handler

> **handler**: [`ListFormHandler`](ListFormHandler.md)\<`U`\>

***

### oncancel?

> `optional` **oncancel**: [`formHandler`](../type-aliases/formHandler.md)\<`ActionFormData`, `U`\>

***

### title?

> `optional` **title**: `string` \| [`LangText`](../type-aliases/LangText.md)

***

### validator?

> `optional` **validator**: [`formBeforeBuild`](../type-aliases/formBeforeBuild.md)\<`ActionFormData`, `U`\>
