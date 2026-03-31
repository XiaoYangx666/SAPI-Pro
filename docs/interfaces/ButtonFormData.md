[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / ButtonFormData

# Interface: ButtonFormData\<U, TData\>

## Extends

- [`CommonFormData`](CommonFormData.md)\<`ActionFormData`, `U`\>

## Type Parameters

### U

`U` *extends* [`contextArgs`](contextArgs.md) = [`contextArgs`](contextArgs.md)

### TData

`TData` = `unknown`

## Properties

### body?

> `optional` **body?**: [`TextType`](../type-aliases/TextType.md)

body

***

### buttonGenerator?

> `optional` **buttonGenerator?**: (`player`, `args`, `t`) => `Iterable`\<[`FuncButton`](FuncButton.md)\<`U`, `TData`\>\>

按钮生成器

#### Parameters

##### player

`Player`

##### args

`U`

##### t

[`UniversalTranslator`](../type-aliases/UniversalTranslator.md)

#### Returns

`Iterable`\<[`FuncButton`](FuncButton.md)\<`U`, `TData`\>\>

***

### buttons?

> `optional` **buttons?**: [`FuncButton`](FuncButton.md)\<`U`, `TData`\>[]

按钮列表

***

### generator?

> `optional` **generator?**: [`formGenerator`](formGenerator.md)\<`ActionFormData`, `U`\>

自定义生成器

#### Inherited from

[`CommonFormData`](CommonFormData.md).[`generator`](CommonFormData.md#generator)

***

### handler?

> `optional` **handler?**: (`ctx`, `button`, `index`) => `void` \| `Promise`\<`void`\>

列表处理(若点击的按钮已有func，则不会调用此函数处理)

#### Parameters

##### ctx

[`SAPIProFormContext`](../classes/SAPIProFormContext.md)\<`ActionFormData`, `U`\>

##### button

按下的按钮 data为构造时附带的数据,btnIndex为排除func按钮后的下标

###### btnIndex

`number`

###### data

`TData`

##### index

`number`

表单选择的下标

#### Returns

`void` \| `Promise`\<`void`\>

***

### oncancel?

> `optional` **oncancel?**: [`formHandler`](../type-aliases/formHandler.md)\<`ActionFormData`, `U`\>

取消事件

***

### title?

> `optional` **title?**: [`TextType`](../type-aliases/TextType.md)

标题

#### Inherited from

[`CommonFormData`](CommonFormData.md).[`title`](CommonFormData.md#title)

***

### validator?

> `optional` **validator?**: [`formBeforeBuild`](../type-aliases/formBeforeBuild.md)\<`ActionFormData`, `U`\>

表单验证器，验证失败则不打开表单
