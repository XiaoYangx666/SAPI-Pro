[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / BaseConfig

# Interface: BaseConfig\<T, U\>

## Extended by

- [`StringConfig`](StringConfig.md)
- [`NumberConfig`](NumberConfig.md)
- [`SliderConfig`](SliderConfig.md)
- [`ToggleConfig`](ToggleConfig.md)
- [`DropdownConfig`](DropdownConfig.md)

## Type Parameters

### T

`T` *extends* [`FieldType`](../enumerations/FieldType.md)

### U

`U`

## Properties

### defaultValue?

> `optional` **defaultValue?**: `Dynamic`\<`FieldTypeMap`\[`T`\], `U`\>

***

### label

> **label**: `Dynamic`\<[`TextType`](../type-aliases/TextType.md), `U`\>

***

### optional?

> `optional` **optional?**: `boolean`

***

### setter?

> `optional` **setter?**: (`value`, `player`, `args`) => `void` \| `Promise`\<`void`\>

#### Parameters

##### value

`FieldTypeMap`\[`T`\]

##### player

`Player`

##### args

`U`

#### Returns

`void` \| `Promise`\<`void`\>

***

### tooltip?

> `optional` **tooltip?**: `Dynamic`\<[`TextType`](../type-aliases/TextType.md) \| `undefined`, `U`\>

***

### type

> **type**: `T`

***

### validators?

> `optional` **validators?**: [`FieldValidator`](../type-aliases/FieldValidator.md)\<`FieldTypeMap`\[`T`\]\>[]
