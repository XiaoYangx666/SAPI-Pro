[**Documentation**](../README.md)

***

[Documentation](../globals.md) / CommandObject

# Interface: CommandObject

Defined in: [Command/main.ts:16](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L16)

## Properties

### explain

> **explain**: `string`

Defined in: [Command/main.ts:20](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L20)

命令解释

***

### handler?

> `optional` **handler**: [`commandHandler`](../type-aliases/commandHandler.md)\<[`ParsedParam`](ParsedParam.md)\>

Defined in: [Command/main.ts:26](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L26)

命令处理器

***

### isAdmin?

> `optional` **isAdmin**: `boolean`

Defined in: [Command/main.ts:22](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L22)

是否管理员命令,默认不是

***

### isClientCommand?

> `optional` **isClientCommand**: `boolean`

Defined in: [Command/main.ts:33](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L33)

***

### isHiden?

> `optional` **isHiden**: `boolean`

Defined in: [Command/main.ts:24](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L24)

是否隐藏命令(不会显示在help中)

***

### name

> **name**: `string`

Defined in: [Command/main.ts:18](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L18)

命令名

***

### paramBranches?

> `optional` **paramBranches**: `paramBranches`[]

Defined in: [Command/main.ts:30](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L30)

命令参数分支

***

### subCommands?

> `optional` **subCommands**: [`CommandObject`](CommandObject.md)[]

Defined in: [Command/main.ts:32](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L32)

子命令列表

***

### validator?

> `optional` **validator**: [`CommandValidator`](CommandValidator.md)

Defined in: [Command/main.ts:28](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L28)

命令验证器
