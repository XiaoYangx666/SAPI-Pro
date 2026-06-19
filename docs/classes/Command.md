[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / Command

# Class: Command

## Constructors

### Constructor

> **new Command**(`name`, `explain`, `isAdmin`, `handler?`, `validator?`, `isHidden?`, `isClient?`): `Command`

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

[`CommandValidator`](../type-aliases/CommandValidator.md)

命令验证器

##### isHidden?

`boolean` = `false`

是否隐藏命令

##### isClient?

`boolean` = `false`

是否客户端命令(客户端行为包)

#### Returns

`Command`

## Properties

### explain

> **explain**: `string`

***

### handler?

> `optional` **handler?**: [`commandHandler`](../type-aliases/commandHandler.md)

***

### isAdmin

> **isAdmin**: `boolean`

***

### isClientCommand?

> `optional` **isClientCommand?**: `boolean`

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

> **subCommands**: `Command`[] = `[]`

***

### validator?

> `optional` **validator?**: [`CommandValidator`](../type-aliases/CommandValidator.md)

## Methods

### addParam()

> **addParam**(`param`): `Command`

添加一条分支并在其中添加一条参数

#### Parameters

##### param

[`ParamDefinition`](../interfaces/ParamDefinition.md)

#### Returns

`Command`

***

### addParamBranches()

> **addParamBranches**(`param`): `Command`

添加多个命令参数分支

#### Parameters

##### param

[`paramBranches`](../type-aliases/paramBranches.md)[]

#### Returns

`Command`

***

### addParams()

> **addParams**(`params`): `Command`

添加一条参数分支的多个参数

#### Parameters

##### params

[`ParamDefinition`](../interfaces/ParamDefinition.md)[]

#### Returns

`Command`

***

### addSubCommand()

> **addSubCommand**(`subCommand`): `Command`

添加子命令

#### Parameters

##### subCommand

`Command`

#### Returns

`Command`

***

### addSubCommands()

> **addSubCommands**(`subCommands`): `Command`

添加一堆子命令

#### Parameters

##### subCommands

`Command`[]

#### Returns

`Command`

***

### setHandler()

> **setHandler**(`handler`): `Command`

#### Parameters

##### handler

[`commandHandler`](../type-aliases/commandHandler.md)

#### Returns

`Command`

***

### setValidator()

> **setValidator**(`validator`): `Command`

#### Parameters

##### validator

[`CommandValidator`](../type-aliases/CommandValidator.md)

#### Returns

`Command`

***

### toNative()

> **toNative**(`nameSpace`): `object`

转换为原生命令以便注册(内部调用)

#### Parameters

##### nameSpace

`string`

#### Returns

`object`

##### cmd

> **cmd**: `object`

###### cmd.cheatsRequired

> **cheatsRequired**: `boolean` = `false`

###### cmd.description

> **description**: `string`

###### cmd.mandatoryParameters

> **mandatoryParameters**: `CustomCommandParameter`[] = `branch.mandatory`

###### cmd.name

> **name**: `string`

###### cmd.optionalParameters

> **optionalParameters**: `CustomCommandParameter`[] = `branch.optional`

###### cmd.permissionLevel

> **permissionLevel**: `CommandPermissionLevel`

##### enums

> **enums**: `Record`\<`string`, `string`[]\> = `branch.enums`

***

### fromObject()

> `static` **fromObject**(`obj`): `Command`

从Object创建命令

#### Parameters

##### obj

[`CommandObject`](../interfaces/CommandObject.md)

#### Returns

`Command`
