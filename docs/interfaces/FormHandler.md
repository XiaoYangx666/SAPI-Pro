[**Documentation**](../README.md)

***

[Documentation](../globals.md) / FormHandler

# Interface: FormHandler()

Defined in: Form/main.ts:54

> **FormHandler**(`player`, `response`, `context`): `undefined` \| `void` \| [`NavigationCommand`](NavigationCommand.md) \| `Promise`\<`undefined` \| [`NavigationCommand`](NavigationCommand.md)\>

Defined in: Form/main.ts:60

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
