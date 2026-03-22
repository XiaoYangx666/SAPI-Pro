[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / SliderField

# Class: SliderField

滑块输入

## Extends

- [`ValueField`](ValueField.md)\<`number`\>

## Constructors

### Constructor

> **new SliderField**(`label`, `min`, `max`, `options?`): `SliderField`

#### Parameters

##### label

`TextType`

##### min

`number`

##### max

`number`

##### options?

###### defaultValue?

`number`

###### step?

`number`

###### tooltip?

`TextType`

#### Returns

`SliderField`

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

是否是值字段

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

### baseValidate()

> `protected` **baseValidate**(`value`): \{ `de_DE`: `string`; `en_US`: `string`; `es_ES`: `string`; `fr_FR`: `string`; `ja_JP`: `string`; `ko_KR`: `string`; `zh_CN`: `string`; `zh_TW`: `string`; \} \| `undefined`

基础类型校验（类型层面）

#### Parameters

##### value

`number`

#### Returns

\{ `de_DE`: `string`; `en_US`: `string`; `es_ES`: `string`; `fr_FR`: `string`; `ja_JP`: `string`; `ko_KR`: `string`; `zh_CN`: `string`; `zh_TW`: `string`; \} \| `undefined`

#### Overrides

[`ValueField`](ValueField.md).[`baseValidate`](ValueField.md#basevalidate)

***

### build()

> **build**(`form`, `t`): `void`

UI 构建

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

设置字段键名，用于最终推导为对象属性

#### Parameters

##### key

`string`

#### Returns

`this`

#### Inherited from

[`ValueField`](ValueField.md).[`key`](ValueField.md#key)

***

### optional()

> **optional**(): `SliderField` & `object`

标记为可选字段

#### Returns

`SliderField` & `object`

#### Inherited from

[`ValueField`](ValueField.md).[`optional`](ValueField.md#optional)

***

### parse()

> **parse**(`raw`): `number`

类型判断与转换，若类型不正确则抛出错误

#### Parameters

##### raw

`ValueType`

#### Returns

`number`

#### Overrides

[`ValueField`](ValueField.md).[`parse`](ValueField.md#parse)

***

### validate()

> **validate**(`value`): `string` \| [`LangText`](../type-aliases/LangText.md) \| `undefined`

执行完整校验链

#### Parameters

##### value

`number`

#### Returns

`string` \| [`LangText`](../type-aliases/LangText.md) \| `undefined`

#### Inherited from

[`ValueField`](ValueField.md).[`validate`](ValueField.md#validate)

***

### validator()

> **validator**(...`v`): `SliderField`

添加自定义验证器

#### Parameters

##### v

...[`FieldValidator`](../type-aliases/FieldValidator.md)\<`number`\>[]

#### Returns

`SliderField`

#### Inherited from

[`ValueField`](ValueField.md).[`validator`](ValueField.md#validator)
