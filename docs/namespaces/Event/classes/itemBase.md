[**Documentation**](../../../README.md)

***

[Documentation](../../../globals.md) / [Event](../README.md) / itemBase

# Class: itemBase

Defined in: [Event.ts:124](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L124)

物品使用订阅

## Constructors

### new itemBase()

> **new itemBase**(): [`itemBase`](itemBase.md)

Defined in: [Event.ts:126](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L126)

#### Returns

[`itemBase`](itemBase.md)

## Methods

### bind()

> **bind**(`itemid`, `func`): `void`

Defined in: [Event.ts:135](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L135)

用来绑定物品使用事件

#### Parameters

##### itemid

`string`

物品id

##### func

(`player`) => `void`

绑定函数，函数参数player

#### Returns

`void`
