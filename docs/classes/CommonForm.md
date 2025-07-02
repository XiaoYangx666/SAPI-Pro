[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / CommonForm

# Class: CommonForm

## Constructors

### new CommonForm()

> **new CommonForm**(): [`CommonForm`](CommonForm.md)

#### Returns

[`CommonForm`](CommonForm.md)

## Methods

### BodyInfoForm()

> `static` **BodyInfoForm**(`title`, `body`): [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`\>

注册一个简单的信息窗口

#### Parameters

##### title

`string`

标题

##### body

内容，可以是生成器

`string` | [`formGenerator`](../interfaces/formGenerator.md)\<`ActionFormData`\>

#### Returns

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`\>

***

### ButtonForm()

> `static` **ButtonForm**(`data`): [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`\>

常用的按钮表单

#### Parameters

##### data

[`ButtonFormData`](../interfaces/ButtonFormData.md)

#### Returns

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`\>

***

### ButtonListForm()

> `static` **ButtonListForm**(`data`): [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`\>

按钮列表表单

#### Parameters

##### data

[`ButtonListFormData`](../interfaces/ButtonListFormData.md)

#### Returns

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`\>

***

### SimpleMessageForm()

> `static` **SimpleMessageForm**(`data`): [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`MessageFormData`\>

一个简单的提示窗口，仅含有两个按钮，

#### Parameters

##### data

[`SimpleMessageFormData`](../interfaces/SimpleMessageFormData.md)

#### Returns

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`MessageFormData`\>
