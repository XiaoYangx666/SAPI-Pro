[**Documentation**](../../../README.md)

***

[Documentation](../../../globals.md) / [Event](../README.md) / ScriptEventBusClass

# Class: ScriptEventBusClass

Defined in: Event.ts:150

ScriptEvent订阅

## Constructors

### new ScriptEventBusClass()

> **new ScriptEventBusClass**(): [`ScriptEventBusClass`](ScriptEventBusClass.md)

#### Returns

[`ScriptEventBusClass`](ScriptEventBusClass.md)

## Properties

### record

> **record**: `Map`\<`any`, `any`\>

Defined in: Event.ts:151

## Methods

### bind()

> **bind**(`id`, `func`): `void`

Defined in: Event.ts:153

注册scriptEvent

#### Parameters

##### id

`string`

##### func

(`t`) => `void`

#### Returns

`void`

***

### publish()

> **publish**(`t`): `void`

Defined in: Event.ts:156

#### Parameters

##### t

`ScriptEventCommandMessageAfterEvent`

#### Returns

`void`
