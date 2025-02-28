[**Documentation**](../README.md)

***

[Documentation](../globals.md) / Command

# Class: Command

Defined in: [Command/main.ts:66](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L66)

## Constructors

### new Command()

> **new Command**(`name`, `explain`, `isAdmin`, `handler`?, `validator`?, `isHidden`?, `isClient`?): [`Command`](Command.md)

Defined in: [Command/main.ts:86](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L86)

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

[`commandHandler`](../type-aliases/commandHandler.md)\<[`ParsedParam`](../interfaces/ParsedParam.md)\>

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

Defined in: [Command/main.ts:68](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L68)

***

### handler?

> `optional` **handler**: [`commandHandler`](../type-aliases/commandHandler.md)\<[`ParsedParam`](../interfaces/ParsedParam.md)\>

Defined in: [Command/main.ts:71](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L71)

***

### isAdmin

> **isAdmin**: `boolean`

Defined in: [Command/main.ts:69](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L69)

***

### isClientCommand?

> `optional` **isClientCommand**: `boolean`

Defined in: [Command/main.ts:73](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L73)

***

### isHidden

> **isHidden**: `boolean`

Defined in: [Command/main.ts:70](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L70)

***

### name

> **name**: `string`

Defined in: [Command/main.ts:67](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L67)

***

### paramBranches

> **paramBranches**: [`ParamDefinition`](../interfaces/ParamDefinition.md)[] = `[]`

Defined in: [Command/main.ts:74](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L74)

***

### subCommands

> **subCommands**: [`Command`](Command.md)[] = `[]`

Defined in: [Command/main.ts:75](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L75)

***

### validator?

> `optional` **validator**: [`CommandValidator`](../interfaces/CommandValidator.md)

Defined in: [Command/main.ts:72](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L72)

## Methods

### addParam()

> **addParam**(`param`): [`Command`](Command.md)

Defined in: [Command/main.ts:111](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L111)

添加一条分支并在其中添加一条参数

#### Parameters

##### param

[`ParamDefinition`](../interfaces/ParamDefinition.md)

#### Returns

[`Command`](Command.md)

***

### addParamBranches()

> **addParamBranches**(`param`): [`Command`](Command.md)

Defined in: [Command/main.ts:122](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L122)

添加多个命令参数分支

#### Parameters

##### param

`paramBranches`[]

#### Returns

[`Command`](Command.md)

***

### addParams()

> **addParams**(`params`): [`Command`](Command.md)

Defined in: [Command/main.ts:116](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L116)

添加一条参数分支的多个参数

#### Parameters

##### params

[`ParamDefinition`](../interfaces/ParamDefinition.md)[]

#### Returns

[`Command`](Command.md)

***

### addSubCommand()

> **addSubCommand**(`subCommand`): [`Command`](Command.md)

Defined in: [Command/main.ts:97](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L97)

添加子命令

#### Parameters

##### subCommand

[`Command`](Command.md)

#### Returns

[`Command`](Command.md)

***

### addSubCommands()

> **addSubCommands**(`subCommands`): [`Command`](Command.md)

Defined in: [Command/main.ts:103](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L103)

添加一堆子命令

#### Parameters

##### subCommands

[`Command`](Command.md)[]

#### Returns

[`Command`](Command.md)

***

### fromObject()

> `static` **fromObject**(`obj`): [`Command`](Command.md)

Defined in: [Command/main.ts:140](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L140)

从Object创建命令

#### Parameters

##### obj

[`CommandObject`](../interfaces/CommandObject.md)

#### Returns

[`Command`](Command.md)
