[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / ButtonFormData

# Interface: ButtonFormData

## Properties

### body?

> `optional` **body**: `string`

***

### buttonGenerator?

> `optional` **buttonGenerator**: [`buttonGenerator`](buttonGenerator.md)

按钮生成器

***

### buttons?

> `optional` **buttons**: `Record`\<`string`, [`FuncButton`](FuncButton.md)\>

按钮对象

***

### generator?

> `optional` **generator**: [`formGenerator`](formGenerator.md)\<`ActionFormData`\>

自定义生成器，如果只需要按钮可以用按钮生成器

***

### oncancel?

> `optional` **oncancel**: [`formHandler`](../type-aliases/formHandler.md)\<`ActionFormData`\>

取消事件

***

### title?

> `optional` **title**: `string`

***

### validator?

> `optional` **validator**: [`formBeforeBuild`](../type-aliases/formBeforeBuild.md)\<`ActionFormData`\>

表单验证器，验证失败则不打开表单
