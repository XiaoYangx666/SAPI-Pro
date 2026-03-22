[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / CommonForm

# Class: CommonForm

## Methods

### BodyInfoForm()

> `static` **BodyInfoForm**\<`U`\>(`title`, `body`, `onSubmit?`): [`BodyInfoForm`](BodyInfoForm.md)\<`U`\>

注册一个简单的信息窗口

#### Type Parameters

##### U

`U` *extends* [`ButtonFormArgs`](../interfaces/ButtonFormArgs.md)

#### Parameters

##### title

[`TextType`](../type-aliases/TextType.md)

标题

##### body

内容，可以是生成器

[`TextType`](../type-aliases/TextType.md) | [`formGenerator`](../interfaces/formGenerator.md)\<`ActionFormData`, `U`\>

##### onSubmit?

(`ctx`) => `void`

提交后执行

#### Returns

[`BodyInfoForm`](BodyInfoForm.md)\<`U`\>

***

### ButtonForm()

> `static` **ButtonForm**\<`U`\>(`data`): [`ButtonForm`](ButtonForm.md)\<`U`\>

常用的按钮表单

#### Type Parameters

##### U

`U` *extends* [`ButtonFormArgs`](../interfaces/ButtonFormArgs.md)

#### Parameters

##### data

[`ButtonFormData`](../interfaces/ButtonFormData.md)\<`U`\>

#### Returns

[`ButtonForm`](ButtonForm.md)\<`U`\>

***

### InputForm()

> `static` **InputForm**\<`TResult`, `U`\>(`data`): [`InputForm`](InputForm.md)\<`U`, `TResult`\>

输入表单

#### Type Parameters

##### TResult

`TResult` *extends* `unknown`

##### U

`U` *extends* [`InputFormArgs`](../interfaces/InputFormArgs.md) = `any`

#### Parameters

##### data

[`InputFormData`](../interfaces/InputFormData.md)\<`U`, `TResult`\>

#### Returns

[`InputForm`](InputForm.md)\<`U`, `TResult`\>

***

### SimpleMessageForm()

> `static` **SimpleMessageForm**\<`U`\>(`data`): [`SimpleMessageForm`](SimpleMessageForm.md)\<`U`\>

一个简单的提示窗口，仅含有两个按钮，

#### Type Parameters

##### U

`U` *extends* [`ButtonFormArgs`](../interfaces/ButtonFormArgs.md)

#### Parameters

##### data

[`SimpleMessageFormData`](../interfaces/SimpleMessageFormData.md)\<`U`\>

#### Returns

[`SimpleMessageForm`](SimpleMessageForm.md)\<`U`\>
