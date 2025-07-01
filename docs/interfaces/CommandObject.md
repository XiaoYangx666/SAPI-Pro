[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / CommandObject

# Interface: CommandObject

## Properties

### explain

> **explain**: `string`

命令解释

***

### handler?

> `optional` **handler**: [`commandHandler`](../type-aliases/commandHandler.md)\<[`ParsedParam`](ParsedParam.md)\>

命令处理器

***

### isAdmin?

> `optional` **isAdmin**: `boolean`

是否管理员命令,默认不是

***

### isClientCommand?

> `optional` **isClientCommand**: `boolean`

***

### isHiden?

> `optional` **isHiden**: `boolean`

是否隐藏命令(不会显示在help中)

***

### name

> **name**: `string`

命令名

***

### paramBranches?

> `optional` **paramBranches**: [`paramBranches`](../type-aliases/paramBranches.md)[]

命令参数分支

***

### subCommands?

> `optional` **subCommands**: [`CommandObject`](CommandObject.md)[]

子命令列表

***

### validator?

> `optional` **validator**: [`CommandValidator`](CommandValidator.md)

命令验证器
