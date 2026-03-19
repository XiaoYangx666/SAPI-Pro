[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / ButtonFormData

# Interface: ButtonFormData\<U\>

## Extends

- [`CommonFormData`](CommonFormData.md)\<`ActionFormData`, `U`\>

## Type Parameters

### U

`U` *extends* [`contextArgs`](contextArgs.md) = [`contextArgs`](contextArgs.md)

## Properties

### body?

> `optional` **body**: [`TextType`](../type-aliases/TextType.md)

body

***

### buttonGenerator()?

> `optional` **buttonGenerator**: (`player`, `args`, `t`) => `Iterable`\<[`FuncButton`](FuncButton.md)\<`U`\>\>

按钮生成器

#### Parameters

##### player

`Player`

##### args

`U`

##### t

[`UniversalTranslator`](../type-aliases/UniversalTranslator.md)

#### Returns

`Iterable`\<[`FuncButton`](FuncButton.md)\<`U`\>\>

***

### buttons?

> `optional` **buttons**: [`FuncButton`](FuncButton.md)\<`U`\>[]

按钮列表

***

### generator?

> `optional` **generator**: [`formGenerator`](formGenerator.md)\<`ActionFormData`, `U`\>

自定义生成器

#### Inherited from

[`CommonFormData`](CommonFormData.md).[`generator`](CommonFormData.md#generator)

***

### handler()?

> `optional` **handler**: (`ctx`, `index`) => `void` \| `Promise`\<`void`\>

列表处理(若点击的按钮已有func，则不会调用此函数处理)

#### Parameters

##### ctx

[`SAPIProFormContext`](../classes/SAPIProFormContext.md)\<`ActionFormData`, `U`\>

##### index

`number`

#### Returns

`void` \| `Promise`\<`void`\>

***

### oncancel?

> `optional` **oncancel**: [`formHandler`](../type-aliases/formHandler.md)\<`ActionFormData`, `U`\>

取消事件

***

### title?

> `optional` **title**: [`TextType`](../type-aliases/TextType.md)

标题

#### Inherited from

[`CommonFormData`](CommonFormData.md).[`title`](CommonFormData.md#title)

***

### validator?

> `optional` **validator**: [`formBeforeBuild`](../type-aliases/formBeforeBuild.md)\<`ActionFormData`, `U`\>

表单验证器，验证失败则不打开表单
