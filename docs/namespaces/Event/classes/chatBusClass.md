[**Documentation**](../../../README.md)

***

[Documentation](../../../globals.md) / [Event](../README.md) / chatBusClass

# Class: chatBusClass

Defined in: [Event.ts:12](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L12)

聊天订阅

## Constructors

### new chatBusClass()

> **new chatBusClass**(): [`chatBusClass`](chatBusClass.md)

Defined in: [Event.ts:15](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L15)

#### Returns

[`chatBusClass`](chatBusClass.md)

## Methods

### regsend()

> **regsend**(`callback`): `void`

Defined in: [Event.ts:56](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L56)

设置聊天处理函数(唯一)

当聊天没有被任一函数取消时，将会调用此函数发送聊天

返回值:是否取消原版聊天发送

#### Parameters

##### callback

(`t`) => `boolean`

#### Returns

`void`

***

### subscribe()

> **subscribe**(`callback`, `priority`): `void`

Defined in: [Event.ts:29](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Event.ts#L29)

订阅聊天事件

返回值:是否取消原版聊天发送

#### Parameters

##### callback

[`chatFunc`](../type-aliases/chatFunc.md)

##### priority

`number` = `0`

#### Returns

`void`
