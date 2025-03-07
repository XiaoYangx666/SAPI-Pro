[**Documentation**](../../../README.md)

---

[Documentation](../../../globals.md) / [Event](../README.md) / chatBusClass

# Class: chatBusClass

聊天订阅类,请使用类的实例[chatBus](../variables/chatBus.md)

## Constructors

### new chatBusClass()

> **new chatBusClass**(): [`chatBusClass`](chatBusClass.md)

#### Returns

[`chatBusClass`](chatBusClass.md)

## Methods

### regsend()

> **regsend**(`callback`): `void`

设置聊天处理函数(唯一)

当聊天没有被任一函数取消时，将会调用此函数发送聊天

返回值:是否取消原版聊天发送

#### Parameters

##### callback

(`t`) => `boolean`

#### Returns

`void`

---

### subscribe()

> **subscribe**(`callback`, `priority`): `void`

订阅聊天事件

#### Parameters

##### callback

[`chatFunc`](../type-aliases/chatFunc.md)

##### priority

`number` = `0`
优先级，高优先级的会先响应，不支持多包

#### Returns

`void`
