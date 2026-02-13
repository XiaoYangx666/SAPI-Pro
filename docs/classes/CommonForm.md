[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / CommonForm

# Class: CommonForm

## Constructors

### Constructor

> **new CommonForm**(): `CommonForm`

#### Returns

`CommonForm`

## Methods

### BodyInfoForm()

> `static` **BodyInfoForm**\<`U`\>(`title`, `body`): [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`, `U`\>

注册一个简单的信息窗口

#### Type Parameters

##### U

`U` *extends* [`ButtonFormArgs`](../interfaces/ButtonFormArgs.md)

#### Parameters

##### title

`string`

标题

##### body

内容，可以是生成器

`string` | [`formGenerator`](../interfaces/formGenerator.md)\<`ActionFormData`, `U`\>

#### Returns

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`, `U`\>

***

### ButtonForm()

> `static` **ButtonForm**\<`U`\>(`data`): [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`, `U`\>

常用的按钮表单

#### Type Parameters

##### U

`U` *extends* [`ButtonFormArgs`](../interfaces/ButtonFormArgs.md)

#### Parameters

##### data

[`ButtonFormData`](../interfaces/ButtonFormData.md)\<`U`\>

#### Returns

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`, `U`\>

***

### ButtonListForm()

> `static` **ButtonListForm**\<`U`\>(`data`): [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`, `U`\>

按钮列表表单

#### Type Parameters

##### U

`U` *extends* [`ButtonFormArgs`](../interfaces/ButtonFormArgs.md)

#### Parameters

##### data

[`ButtonListFormData`](../interfaces/ButtonListFormData.md)\<`U`\>

#### Returns

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`ActionFormData`, `U`\>

***

### SimpleMessageForm()

> `static` **SimpleMessageForm**\<`U`\>(`data`): [`SAPIProForm`](../interfaces/SAPIProForm.md)\<`MessageFormData`, `U`\>

一个简单的提示窗口，仅含有两个按钮，

#### Type Parameters

##### U

`U` *extends* [`ButtonFormArgs`](../interfaces/ButtonFormArgs.md)

#### Parameters

##### data

[`SimpleMessageFormData`](../interfaces/SimpleMessageFormData.md)\<`U`\>

#### Returns

[`SAPIProForm`](../interfaces/SAPIProForm.md)\<`MessageFormData`, `U`\>
