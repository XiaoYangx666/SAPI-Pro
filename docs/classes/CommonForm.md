[**Documentation**](../README.md)

***

[Documentation](../globals.md) / CommonForm

# Class: CommonForm

Defined in: [Form/commonForm.ts:4](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Form/commonForm.ts#L4)

## Constructors

### new CommonForm()

> **new CommonForm**(): [`CommonForm`](CommonForm.md)

#### Returns

[`CommonForm`](CommonForm.md)

## Methods

### BodyInfoForm()

> `static` **BodyInfoForm**(`id`, `title`, `body`): `void`

Defined in: [Form/commonForm.ts:84](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Form/commonForm.ts#L84)

注册一个简单的信息窗口

#### Parameters

##### id

`string`

##### title

`string`

标题

##### body

内容，可以是生成器

`string` | [`formGenerator`](../interfaces/formGenerator.md)\<`ActionFormData`\>

#### Returns

`void`

***

### ButtonForm()

> `static` **ButtonForm**(`id`, `data`): `void`

Defined in: [Form/commonForm.ts:6](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Form/commonForm.ts#L6)

常用的按钮表单

#### Parameters

##### id

`string`

##### data

[`ButtonFormData`](../interfaces/ButtonFormData.md)

#### Returns

`void`

***

### ButtonListForm()

> `static` **ButtonListForm**(`id`, `data`): `void`

Defined in: [Form/commonForm.ts:37](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Form/commonForm.ts#L37)

按钮列表表单

#### Parameters

##### id

`string`

##### data

[`ButtonListFormData`](../interfaces/ButtonListFormData.md)

#### Returns

`void`

***

### SimpleMessageForm()

> `static` **SimpleMessageForm**(`id`, `data`): `void`

Defined in: [Form/commonForm.ts:63](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Form/commonForm.ts#L63)

一个简单的提示窗口，仅含有两个按钮，

#### Parameters

##### id

`string`

##### data

[`SimpleMessageFormData`](../interfaces/SimpleMessageFormData.md)

#### Returns

`void`
