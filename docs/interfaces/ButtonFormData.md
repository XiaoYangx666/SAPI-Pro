[**Documentation**](../README.md)

***

[Documentation](../globals.md) / ButtonFormData

# Interface: ButtonFormData

Defined in: Form/commonForm.ts:118

## Properties

### body?

> `optional` **body**: `string`

Defined in: Form/commonForm.ts:120

***

### buttonGenerator?

> `optional` **buttonGenerator**: [`buttonGenerator`](buttonGenerator.md)

Defined in: Form/commonForm.ts:124

按钮生成器

***

### buttons?

> `optional` **buttons**: `Record`\<`string`, [`FuncButton`](FuncButton.md)\>

Defined in: Form/commonForm.ts:122

按钮对象

***

### generator?

> `optional` **generator**: [`formGenerator`](formGenerator.md)\<`ActionFormData`\>

Defined in: Form/commonForm.ts:128

自定义生成器，如果只需要按钮可以用按钮生成器

***

### oncancel?

> `optional` **oncancel**: [`FormHandler`](FormHandler.md)

Defined in: Form/commonForm.ts:126

取消事件

***

### title?

> `optional` **title**: `string`

Defined in: Form/commonForm.ts:119

***

### validator?

> `optional` **validator**: [`FormValidator`](FormValidator.md)

Defined in: Form/commonForm.ts:130

表单验证器，验证失败则不打开表单
