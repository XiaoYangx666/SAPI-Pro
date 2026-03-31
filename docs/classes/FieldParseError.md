[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / FieldParseError

# Class: FieldParseError

## Extends

- `Error`

## Constructors

### Constructor

> **new FieldParseError**(`message`, `translation`, `options?`): `FieldParseError`

#### Parameters

##### message

`string`

##### translation

[`LangText`](../type-aliases/LangText.md)

##### options?

`ErrorOptions`

#### Returns

`FieldParseError`

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause?**: `unknown`

#### Inherited from

`Error.cause`

***

### message

> **message**: `string`

#### Inherited from

`Error.message`

***

### name

> **name**: `string`

#### Inherited from

`Error.name`

***

### stack?

> `optional` **stack?**: `string`

#### Inherited from

`Error.stack`

***

### translation

> **translation**: [`LangText`](../type-aliases/LangText.md)

## Methods

### isError()

> `static` **isError**(`error`): `error is Error`

Indicates whether the argument provided is a built-in Error instance or not.

#### Parameters

##### error

`unknown`

#### Returns

`error is Error`

#### Inherited from

`Error.isError`
