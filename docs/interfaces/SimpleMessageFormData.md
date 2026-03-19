[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / SimpleMessageFormData

# Interface: SimpleMessageFormData\<U\>

## Extends

- [`CommonFormData`](CommonFormData.md)\<`MessageFormData`, `U`\>

## Type Parameters

### U

`U` *extends* [`contextArgs`](contextArgs.md) = [`contextArgs`](contextArgs.md)

## Properties

### body?

> `optional` **body**: [`TextType`](../type-aliases/TextType.md)

body

***

### button1?

> `optional` **button1**: [`MessageFormButton`](MessageFormButton.md)\<`U`\>

***

### button2?

> `optional` **button2**: [`MessageFormButton`](MessageFormButton.md)\<`U`\>

***

### generator?

> `optional` **generator**: [`formGenerator`](formGenerator.md)\<`MessageFormData`, `U`\>

自定义生成器

#### Inherited from

[`CommonFormData`](CommonFormData.md).[`generator`](CommonFormData.md#generator)

***

### title?

> `optional` **title**: [`TextType`](../type-aliases/TextType.md)

标题

#### Inherited from

[`CommonFormData`](CommonFormData.md).[`title`](CommonFormData.md#title)
