[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / SliderConfig

# Interface: SliderConfig\<U\>

## Extends

- [`BaseConfig`](BaseConfig.md)\<[`Slider`](../enumerations/FieldType.md#slider), `U`\>

## Type Parameters

### U

`U`

## Properties

### defaultValue?

> `optional` **defaultValue?**: `Dynamic`\<`number`, `U`\>

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`defaultValue`](BaseConfig.md#defaultvalue)

***

### label

> **label**: `Dynamic`\<[`TextType`](../type-aliases/TextType.md), `U`\>

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`label`](BaseConfig.md#label)

***

### max

> **max**: `Dynamic`\<`number`, `U`\>

***

### min

> **min**: `Dynamic`\<`number`, `U`\>

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

`number`

##### player

`Player`

##### args

`U`

#### Returns

`void` \| `Promise`\<`void`\>

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`setter`](BaseConfig.md#setter)

***

### step?

> `optional` **step?**: `Dynamic`\<`number`, `U`\>

***

### tooltip?

> `optional` **tooltip?**: `Dynamic`\<[`TextType`](../type-aliases/TextType.md) \| `undefined`, `U`\>

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`tooltip`](BaseConfig.md#tooltip)

***

### type

> **type**: [`Slider`](../enumerations/FieldType.md#slider)

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`type`](BaseConfig.md#type)

***

### validators?

> `optional` **validators?**: [`FieldValidator`](../type-aliases/FieldValidator.md)\<`number`\>[]

#### Inherited from

[`BaseConfig`](BaseConfig.md).[`validators`](BaseConfig.md#validators)
