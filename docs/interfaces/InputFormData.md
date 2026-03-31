[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / InputFormData

# Interface: InputFormData\<U, TResult\>

输入表单配置

## Extends

- [`CommonFormData`](CommonFormData.md)\<`ModalFormData`, `U`\>

## Type Parameters

### U

`U` *extends* [`InputFormArgs`](InputFormArgs.md)

传递给表单的参数类型

### TResult

`TResult` = `any`

表单解析后的数据类型

## Properties

### fields?

> `optional` **fields?**: [`BaseField`](../classes/BaseField.md)[]

表单字段列表（输入框、开关、下拉、UI组件等）

***

### fieldsGenerator?

> `optional` **fieldsGenerator?**: (`player`, `args`) => [`BaseField`](../classes/BaseField.md)[]

动态生成字段（构建表单时追加到 fields 后）

#### Parameters

##### player

`Player`

##### args

`U`

#### Returns

[`BaseField`](../classes/BaseField.md)[]

***

### generator?

> `optional` **generator?**: [`formGenerator`](formGenerator.md)\<`ModalFormData`, `U`\>

自定义生成器

#### Inherited from

[`CommonFormData`](CommonFormData.md).[`generator`](CommonFormData.md#generator)

***

### onCancel?

> `optional` **onCancel?**: [`formHandler`](../type-aliases/formHandler.md)\<`ModalFormData`, `U`\>

玩家取消表单时回调

***

### onFormValidateFailed?

> `optional` **onFormValidateFailed?**: (`ctx`, `validationMes`, `data`) => `void` \| `Promise`\<`void`\>

表单整体校验失败回调。
若提供此函数，框架不会自动提示或重新打开表单。

#### Parameters

##### ctx

[`SAPIProFormContext`](../classes/SAPIProFormContext.md)\<`ModalFormData`, `U`\>

##### validationMes

`string` \| [`LangText`](../type-aliases/LangText.md)

##### data

`TResult`

#### Returns

`void` \| `Promise`\<`void`\>

***

### onSubmit

> **onSubmit**: (`data`, `ctx`) => `void` \| `Promise`\<`void`\>

所有验证通过后的提交回调

#### Parameters

##### data

`TResult`

##### ctx

[`SAPIProFormContext`](../classes/SAPIProFormContext.md)\<`ModalFormData`, `U`\>

#### Returns

`void` \| `Promise`\<`void`\>

***

### onValidateFailed?

> `optional` **onValidateFailed?**: (`ctx`, `field`, `validationMes`) => `void` \| `Promise`\<`void`\>

字段验证失败回调。
若提供此函数，框架不会自动提示或重新打开表单。

#### Parameters

##### ctx

[`SAPIProFormContext`](../classes/SAPIProFormContext.md)\<`ModalFormData`, `U`\>

##### field

[`ValueField`](../classes/ValueField.md)\<`any`\>

##### validationMes

`string` \| [`LangText`](../type-aliases/LangText.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### submitButton?

> `optional` **submitButton?**: [`TextType`](../type-aliases/TextType.md)

提交按钮文本

***

### title?

> `optional` **title?**: [`TextType`](../type-aliases/TextType.md)

标题

#### Inherited from

[`CommonFormData`](CommonFormData.md).[`title`](CommonFormData.md#title)

***

### validateForm?

> `optional` **validateForm?**: (`data`) => `string` \| [`LangText`](../type-aliases/LangText.md) \| `undefined`

表单整体校验（用于跨字段验证）。
返回错误信息表示失败，undefined 表示通过。

#### Parameters

##### data

`TResult`

#### Returns

`string` \| [`LangText`](../type-aliases/LangText.md) \| `undefined`

***

### validationMessage?

> `optional` **validationMessage?**: `boolean`

是否显示默认验证失败提示（默认 true）
