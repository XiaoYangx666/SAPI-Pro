[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / ToggleConfig

# Interface: ToggleConfig\<U\>

## Extends

- [`BaseConfig`](BaseConfig.md)\<[`Boolean`](../enumerations/FieldType.md#boolean), `U`\>

## Type Parameters

### U

`U`

## Properties

### defaultValue?

> `optional` **defaultValue?**: `Dynamic`\<`boolean`, `U`\>

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`defaultValue`](BaseConfig.md#defaultvalue)

***

### label

> **label**: `Dynamic`\<[`TextType`](../type-aliases/TextType.md), `U`\>

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`label`](BaseConfig.md#label)

***

### optional?

> `optional` **optional?**: `boolean`

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`optional`](BaseConfig.md#optional)

***

### setter?

> `optional` **setter?**: (`value`, `player`, `args`) => `void` \| `Promise`\<`void`\>

#### Parameters

##### value

`boolean`

##### player

`Player`

##### args

`U`

#### Returns

`void` \| `Promise`\<`void`\>

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`setter`](BaseConfig.md#setter)

***

### tooltip?

> `optional` **tooltip?**: `Dynamic`\<[`TextType`](../type-aliases/TextType.md) \| `undefined`, `U`\>

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`tooltip`](BaseConfig.md#tooltip)

***

### type

> **type**: [`Boolean`](../enumerations/FieldType.md#boolean)

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`type`](BaseConfig.md#type)

***

### validators?

> `optional` **validators?**: [`FieldValidator`](../type-aliases/FieldValidator.md)\<`boolean`\>[]

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`validators`](BaseConfig.md#validators)
