[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / StringConfig

# Interface: StringConfig\<U\>

## Extends

- [`BaseConfig`](BaseConfig.md)\<[`String`](../enumerations/FieldType.md#string), `U`\>

## Type Parameters

### U

`U`

## Properties

### defaultValue?

> `optional` **defaultValue?**: `Dynamic`\<`string`, `U`\>

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

### placeholder?

> `optional` **placeholder?**: `Dynamic`\<[`TextType`](../type-aliases/TextType.md), `U`\>

***

### setter?

> `optional` **setter?**: (`value`, `player`, `args`) => `void` \| `Promise`\<`void`\>

#### Parameters

##### value

`string`

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

> **type**: [`String`](../enumerations/FieldType.md#string)

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`type`](BaseConfig.md#type)

***

### validators?

> `optional` **validators?**: [`FieldValidator`](../type-aliases/FieldValidator.md)\<`string`\>[]

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`validators`](BaseConfig.md#validators)
