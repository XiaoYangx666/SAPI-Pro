[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / ValueField

# Abstract Class: ValueField\<T\>

## Extends

- [`BaseField`](BaseField.md)

## Extended by

- [`TextField`](TextField.md)
- [`NumberField`](NumberField.md)
- [`SliderField`](SliderField.md)
- [`ToggleField`](ToggleField.md)
- [`DropDownField`](DropDownField.md)

## Type Parameters

### T

`T` *extends* `ValueType`

## Constructors

### Constructor

> **new ValueField**\<`T`\>(): `ValueField`\<`T`\>

#### Returns

`ValueField`\<`T`\>

#### Inherited from

[`BaseField`](BaseField.md).[`constructor`](BaseField.md#constructor)

## Properties

### \_\_optional

> `protected` **\_\_optional**: `boolean` = `false`

***

### \_key?

> `protected` `optional` **\_key?**: `string`

***

### isValueField

> `readonly` **isValueField**: `true` = `true`

#### Overrides

[`BaseField`](BaseField.md).[`isValueField`](BaseField.md#isvaluefield)

***

### validators

> `protected` **validators**: [`FieldValidator`](../type-aliases/FieldValidator.md)\<`T`\>[] = `[]`

## Accessors

### isOptional

#### Get Signature

> **get** **isOptional**(): `boolean`

##### Returns

`boolean`

## Methods

### build()

> `abstract` **build**(`form`, `t`): `void`

#### Parameters

##### form

`ModalFormData`

##### t

[`UniversalTranslator`](../type-aliases/UniversalTranslator.md)

#### Returns

`void`

#### Inherited from

[`BaseField`](BaseField.md).[`build`](BaseField.md#build)

***

### getKey()

> **getKey**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

***

### key()

> **key**(`key`): `this`

#### Parameters

##### key

`string`

#### Returns

`this`

***

### optional()

> **optional**(): `ValueField`\<`T`\> & `object`

#### Returns

`ValueField`\<`T`\> & `object`

***

### parse()

> `abstract` **parse**(`raw`): `T` \| `undefined`

将 UI 原始值解析为目标类型。
- 如果是基础类型错误（如期待数字却得到布尔），抛出对应类型的 ParseError。
- 如果是数值格式错误（如 TextField 输入了非数字），抛出格式 ParseError。

#### Parameters

##### raw

`ValueType`

#### Returns

`T` \| `undefined`

***

### validate()

> **validate**(`value`): `string` \| [`LangText`](../type-aliases/LangText.md) \| `undefined`

执行校验链。
- isEmpty 判定：undefined 或空字符串。
- 如果必填且为空，返回 Field_Empty 错误。

#### Parameters

##### value

`T` \| `undefined`

#### Returns

`string` \| [`LangText`](../type-aliases/LangText.md) \| `undefined`

***

### validator()

> **validator**(...`v`): `ValueField`\<`T`\>

#### Parameters

##### v

...[`FieldValidator`](../type-aliases/FieldValidator.md)\<`T`\>[]

#### Returns

`ValueField`\<`T`\>
