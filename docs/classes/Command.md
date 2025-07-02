[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / Command

# Class: Command

## Constructors

### new Command()

> **new Command**(`name`, `explain`, `isAdmin`, `handler`?, `validator`?, `isHidden`?, `isClient`?): [`Command`](Command.md)

构造新命令(复杂的推荐用Command.fromObject)

#### Parameters

##### name

`string`

命令名

##### explain

`string`

命令解释

##### isAdmin

`boolean`

是否管理员命令，默认否

##### handler?

[`commandHandler`](../type-aliases/commandHandler.md)

命令处理器

##### validator?

[`CommandValidator`](../interfaces/CommandValidator.md)

命令验证器

##### isHidden?

`boolean` = `false`

是否隐藏命令

##### isClient?

`boolean` = `false`

是否客户端命令(客户端行为包)

#### Returns

[`Command`](Command.md)

## Properties

### explain

> **explain**: `string`

***

### handler?

> `optional` **handler**: [`commandHandler`](../type-aliases/commandHandler.md)

***

### isAdmin

> **isAdmin**: `boolean`

***

### isClientCommand?

> `optional` **isClientCommand**: `boolean`

***

### isHidden

> **isHidden**: `boolean`

***

### name

> **name**: `string`

***

### paramBranches

> **paramBranches**: [`ParamDefinition`](../interfaces/ParamDefinition.md)[] = `[]`

***

### subCommands

> **subCommands**: [`Command`](Command.md)[] = `[]`

***

### validator?

> `optional` **validator**: [`CommandValidator`](../interfaces/CommandValidator.md)

## Methods

### addParam()

> **addParam**(`param`): [`Command`](Command.md)

添加一条分支并在其中添加一条参数

#### Parameters

##### param

[`ParamDefinition`](../interfaces/ParamDefinition.md)

#### Returns

[`Command`](Command.md)

***

### addParamBranches()

> **addParamBranches**(`param`): [`Command`](Command.md)

添加多个命令参数分支

#### Parameters

##### param

[`paramBranches`](../type-aliases/paramBranches.md)[]

#### Returns

[`Command`](Command.md)

***

### addParams()

> **addParams**(`params`): [`Command`](Command.md)

添加一条参数分支的多个参数

#### Parameters

##### params

[`ParamDefinition`](../interfaces/ParamDefinition.md)[]

#### Returns

[`Command`](Command.md)

***

### addSubCommand()

> **addSubCommand**(`subCommand`): [`Command`](Command.md)

添加子命令

#### Parameters

##### subCommand

[`Command`](Command.md)

#### Returns

[`Command`](Command.md)

***

### addSubCommands()

> **addSubCommands**(`subCommands`): [`Command`](Command.md)

添加一堆子命令

#### Parameters

##### subCommands

[`Command`](Command.md)[]

#### Returns

[`Command`](Command.md)

***

### getFlatBranch()

> **getFlatBranch**(): `object`

获取一条参数

#### Returns

`object`

##### mandatory

> **mandatory**: `CustomCommandParameter`[] = `branch`

##### optional

> **optional**: `CustomCommandParameter`[]

***

### toNative()

> **toNative**(`nameSpace`): `CustomCommand`

#### Parameters

##### nameSpace

`string`

#### Returns

`CustomCommand`

***

### fromObject()

> `static` **fromObject**(`obj`): [`Command`](Command.md)

从Object创建命令

#### Parameters

##### obj

[`CommandObject`](../interfaces/CommandObject.md)

#### Returns

[`Command`](Command.md)
