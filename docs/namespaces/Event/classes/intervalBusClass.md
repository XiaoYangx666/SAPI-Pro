[**Documentation**](../../../README.md)

***

[Documentation](../../../globals.md) / [Event](../README.md) / intervalBusClass

# Class: intervalBusClass

Defined in: [Event.ts:70](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L70)

订阅周期事件

## Constructors

### new intervalBusClass()

> **new intervalBusClass**(): [`intervalBusClass`](intervalBusClass.md)

Defined in: [Event.ts:76](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L76)

#### Returns

[`intervalBusClass`](intervalBusClass.md)

## Methods

### subscribemin()

> **subscribemin**(`callback`): `void`

Defined in: [Event.ts:101](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L101)

#### Parameters

##### callback

() => `void`

#### Returns

`void`

***

### subscribesec()

> **subscribesec**(`callback`): `void`

Defined in: [Event.ts:98](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L98)

#### Parameters

##### callback

(`lastsec`) => `void`

#### Returns

`void`

***

### subscribetick()

> **subscribetick**(`callback`): `void`

Defined in: [Event.ts:95](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L95)

#### Parameters

##### callback

() => `void`

#### Returns

`void`
