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

> `protected` `optional` **\_key**: `string`

***

### isValueField

> `readonly` **isValueField**: `true` = `true`

是否是值字段

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

### baseValidate()

> `abstract` `protected` **baseValidate**(`value`): `string` \| [`LangText`](../type-aliases/LangText.md) \| `undefined`

基础类型校验（类型层面）

#### Parameters

##### value

`T`

#### Returns

`string` \| [`LangText`](../type-aliases/LangText.md) \| `undefined`

***

### build()

> `abstract` **build**(`form`, `t`): `void`

UI 构建

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

设置字段键名，用于最终推导为对象属性

#### Parameters

##### key

`string`

#### Returns

`this`

***

### optional()

> **optional**(): `ValueField`\<`T`\> & `object`

标记为可选字段

#### Returns

`ValueField`\<`T`\> & `object`

***

### parse()

> `abstract` **parse**(`raw`): `T`

类型判断与转换，若类型不正确则抛出错误

#### Parameters

##### raw

`ValueType`

#### Returns

`T`

***

### validate()

> **validate**(`value`): `string` \| [`LangText`](../type-aliases/LangText.md) \| `undefined`

执行完整校验链

#### Parameters

##### value

`T`

#### Returns

`string` \| [`LangText`](../type-aliases/LangText.md) \| `undefined`

***

### validator()

> **validator**(...`v`): `ValueField`\<`T`\>

添加自定义验证器

#### Parameters

##### v

...[`FieldValidator`](../type-aliases/FieldValidator.md)\<`T`\>[]

#### Returns

`ValueField`\<`T`\>
