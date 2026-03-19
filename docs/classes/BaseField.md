[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / BaseField

# Abstract Class: BaseField

## Extended by

- [`ValueField`](ValueField.md)
- [`DividerField`](DividerField.md)
- [`LabelField`](LabelField.md)

## Constructors

### Constructor

> **new BaseField**(): `BaseField`

#### Returns

`BaseField`

## Properties

### isValueField

> `readonly` **isValueField**: `boolean` = `false`

是否是值字段

## Methods

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
