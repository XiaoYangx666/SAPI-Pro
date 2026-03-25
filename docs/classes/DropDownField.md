[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / DropDownField

# Class: DropDownField

下拉菜单

## Extends

- [`ValueField`](ValueField.md)\<`number`\>

## Constructors

### Constructor

> **new DropDownField**(`label`, `items`, `defaultValueIndex`, `tooltip?`): `DropDownField`

#### Parameters

##### label

`TextType`

##### items

`TextType`[]

##### defaultValueIndex

`number` = `0`

##### tooltip?

`TextType`

#### Returns

`DropDownField`

#### Overrides

[`ValueField`](ValueField.md).[`constructor`](ValueField.md#constructor)

## Properties

### \_\_optional

> `protected` **\_\_optional**: `boolean` = `false`

#### Inherited from

[`ValueField`](ValueField.md).[`__optional`](ValueField.md#__optional)

***

### \_key?

> `protected` `optional` **\_key**: `string`

#### Inherited from

[`ValueField`](ValueField.md).[`_key`](ValueField.md#_key)

***

### isValueField

> `readonly` **isValueField**: `true` = `true`

#### Inherited from

[`ValueField`](ValueField.md).[`isValueField`](ValueField.md#isvaluefield)

***

### validators

> `protected` **validators**: [`FieldValidator`](../type-aliases/FieldValidator.md)\<`number`\>[] = `[]`

#### Inherited from

[`ValueField`](ValueField.md).[`validators`](ValueField.md#validators)

## Accessors

### isOptional

#### Get Signature

> **get** **isOptional**(): `boolean`

##### Returns

`boolean`

#### Inherited from

[`ValueField`](ValueField.md).[`isOptional`](ValueField.md#isoptional)

## Methods

### build()

> **build**(`form`, `t`): `void`

#### Parameters

##### form

`ModalFormData`

##### t

[`UniversalTranslator`](../type-aliases/UniversalTranslator.md)

#### Returns

`void`

#### Overrides

[`ValueField`](ValueField.md).[`build`](ValueField.md#build)

***

### getKey()

> **getKey**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

#### Inherited from

[`ValueField`](ValueField.md).[`getKey`](ValueField.md#getkey)

***

### key()

> **key**(`key`): `this`

#### Parameters

##### key

`string`

#### Returns

`this`

#### Inherited from

[`ValueField`](ValueField.md).[`key`](ValueField.md#key)

***

### optional()

> **optional**(): `DropDownField` & `object`

#### Returns

`DropDownField` & `object`

#### Inherited from

[`ValueField`](ValueField.md).[`optional`](ValueField.md#optional)

***

### parse()

> **parse**(`raw`): `number` \| `undefined`

将 UI 原始值解析为目标类型。
- 如果是基础类型错误（如期待数字却得到布尔），抛出对应类型的 ParseError。
- 如果是数值格式错误（如 TextField 输入了非数字），抛出格式 ParseError。

#### Parameters

##### raw

`ValueType`

#### Returns

`number` \| `undefined`

#### Overrides

[`ValueField`](ValueField.md).[`parse`](ValueField.md#parse)

***

### validate()

> **validate**(`value`): `string` \| [`LangText`](../type-aliases/LangText.md) \| `undefined`

执行校验链。
- isEmpty 判定：undefined 或空字符串。
- 如果必填且为空，返回 Field_Empty 错误。

#### Parameters

##### value

`number` \| `undefined`

#### Returns

`string` \| [`LangText`](../type-aliases/LangText.md) \| `undefined`

#### Inherited from

[`ValueField`](ValueField.md).[`validate`](ValueField.md#validate)

***

### validator()

> **validator**(...`v`): `DropDownField`

#### Parameters

##### v

...[`FieldValidator`](../type-aliases/FieldValidator.md)\<`number`\>[]

#### Returns

`DropDownField`

#### Inherited from

[`ValueField`](ValueField.md).[`validator`](ValueField.md#validator)
