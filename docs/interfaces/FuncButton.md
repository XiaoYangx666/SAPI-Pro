[**sapi-pro**](../README.md)

---

[sapi-pro](../globals.md) / FuncButton

# Interface: FuncButton\<U, TData\>

## Type Parameters

### U

`U` _extends_ [`contextArgs`](contextArgs.md)

### TData

`TData` = `unknown`

## Properties

### data?

> `optional` **data**: `TData`

附带自定义属性

---

### func()?

> `optional` **func**: (`context`) => `void` \| `Promise`\<`void`\>

按钮点击事件

#### Parameters

##### context

[`SAPIProFormContext`](../classes/SAPIProFormContext.md)\<`ActionFormData`, `U`\>

#### Returns

`void` \| `Promise`\<`void`\>

---

### icon?

> `optional` **icon**: `string`

图标路径，从textures/后面开始输

---

### isAdmin?

> `optional` **isAdmin?**: `boolean`

是否要求管理员权限

---

### label

> **label**: [`TextType`](../type-aliases/TextType.md)

按钮文本(支持翻译)

---

### shouldShow()?

> `optional` **shouldShow**: (`player`, `args`) => `boolean`

按钮是否应该显示(默认显示)

#### Parameters

##### player

`Player`

##### args

`U`

#### Returns

`boolean`
