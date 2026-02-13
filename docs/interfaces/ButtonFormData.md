[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / ButtonFormData

# Interface: ButtonFormData\<U\>

## Type Parameters

### U

`U` *extends* [`contextArgs`](contextArgs.md) = [`contextArgs`](contextArgs.md)

## Properties

### body?

> `optional` **body**: `string` \| [`LangText`](../type-aliases/LangText.md)

***

### buttonGenerator?

> `optional` **buttonGenerator**: [`buttonGenerator`](buttonGenerator.md)\<`U`\>

按钮生成器

***

### buttons?

> `optional` **buttons**: `Record`\<`string`, [`FuncButton`](FuncButton.md)\<`U`\>\>

按钮对象

***

### generator?

> `optional` **generator**: [`formGenerator`](formGenerator.md)\<`ActionFormData`, `U`\>

自定义生成器，如果只需要按钮可以用按钮生成器

***

### oncancel?

> `optional` **oncancel**: [`formHandler`](../type-aliases/formHandler.md)\<`ActionFormData`, `U`\>

取消事件

***

### title?

> `optional` **title**: `string` \| [`LangText`](../type-aliases/LangText.md)

***

### validator?

> `optional` **validator**: [`formBeforeBuild`](../type-aliases/formBeforeBuild.md)\<`ActionFormData`, `U`\>

表单验证器，验证失败则不打开表单
