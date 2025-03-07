[**Documentation**](../README.md)

---

[Documentation](../globals.md) / FormHandler

# Interface: FormHandler()

> **FormHandler**(`player`, `response`, `context`): `undefined` \| `void` \| [NavigationCommand](NavigationCommand.md) \| `Promise`\<`undefined` \| [NavigationCommand](NavigationCommand.md)\>

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

`undefined` \| `void` \| [NavigationCommand](NavigationCommand.md) \| `Promise`\<`undefined` \| [NavigationCommand](NavigationCommand.md)\>
返回处理结果
