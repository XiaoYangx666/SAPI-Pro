[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / FuncButton

# Interface: FuncButton\<U\>

## Type Parameters

### U

`U` *extends* [`contextArgs`](contextArgs.md)

## Properties

### func()

> **func**: (`context`) => `void` \| `Promise`\<`void`\>

按钮点击事件

#### Parameters

##### context

[`SAPIProFormContext`](../classes/SAPIProFormContext.md)\<`ActionFormData`, `U`\>

#### Returns

`void` \| `Promise`\<`void`\>

***

### icon?

> `optional` **icon**: `string`

图标路径，从textures/后面开始输

***

### translation?

> `optional` **translation**: [`LangText`](../type-aliases/LangText.md)
