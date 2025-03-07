[**Documentation**](../../../README.md)

***

[Documentation](../../../globals.md) / [Event](../README.md) / ScriptEventBusClass

# Class: ScriptEventBusClass

Defined in: [Event.ts:150](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L150)

ScriptEvent订阅

## Constructors

### new ScriptEventBusClass()

> **new ScriptEventBusClass**(): [`ScriptEventBusClass`](ScriptEventBusClass.md)

Defined in: [Event.ts:152](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L152)

#### Returns

[`ScriptEventBusClass`](ScriptEventBusClass.md)

## Properties

### record

> **record**: `Map`\<`any`, `any`\>

Defined in: [Event.ts:151](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L151)

## Methods

### bind()

> **bind**(`id`, `func`): `void`

Defined in: [Event.ts:158](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L158)

注册scriptEvent

#### Parameters

##### id

`string`

##### func

(`t`) => `void`

#### Returns

`void`
