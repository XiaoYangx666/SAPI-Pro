[**Documentation**](../README.md)

***

[Documentation](../globals.md) / FormHandler

# Interface: FormHandler()

Defined in: [Form/main.ts:54](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Form/main.ts#L54)

> **FormHandler**(`player`, `response`, `context`): `undefined` \| `void` \| [`NavigationCommand`](NavigationCommand.md) \| `Promise`\<`undefined` \| [`NavigationCommand`](NavigationCommand.md)\>

Defined in: [Form/main.ts:60](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Form/main.ts#L60)

表单处理函数

## Parameters

### player

`Player`

### response

表单返回

`ActionFormResponse` | `MessageFormResponse` | `ModalFormResponse`

### context

[`context`](context.md)

表单上下文，可用于获取传值

## Returns

`undefined` \| `void` \| [`NavigationCommand`](NavigationCommand.md) \| `Promise`\<`undefined` \| [`NavigationCommand`](NavigationCommand.md)\>
