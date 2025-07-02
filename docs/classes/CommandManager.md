[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / CommandManager

# Class: CommandManager

## Constructors

### new CommandManager()

> **new CommandManager**(`parser`): [`CommandManager`](CommandManager.md)

#### Parameters

##### parser

`CommandParser`

#### Returns

[`CommandManager`](CommandManager.md)

## Properties

### commands

> **commands**: `Map`\<`string`, [`Command`](Command.md)\>

***

### help?

> `optional` **help**: `CommandHelp`

***

### nativeCommands

> **nativeCommands**: [`Command`](Command.md)[] = `[]`

***

### testMode

> **testMode**: `boolean` = `false`

## Methods

### getCommandInfo()

> **getCommandInfo**(`command`): `undefined` \| [`Command`](Command.md)

#### Parameters

##### command

`string`

#### Returns

`undefined` \| [`Command`](Command.md)

***

### getCommandsList()

> **getCommandsList**(`admin`): `string`[]

#### Parameters

##### admin

`boolean`

#### Returns

`string`[]

***

### init()

> **init**(`help`): `void`

#### Parameters

##### help

`CommandHelp`

#### Returns

`void`

***

### parseCommand()

> **parseCommand**(`input`, `player`): `void`

#### Parameters

##### input

`string`

##### player

`Player`

#### Returns

`void`

***

### regClientCommand()

> **regClientCommand**(): `void`

注册客户端命令(系统调用，不用管)

#### Returns

`void`

***

### registerCommand()

> **registerCommand**(`command`): `void`

注册命令

#### Parameters

##### command

[`Command`](Command.md)

#### Returns

`void`

***

### registerNative()

> **registerNative**(`command`): `void`

注册原生指令

#### Parameters

##### command

[`Command`](Command.md)

#### Returns

`void`

***

### regToHost()

> **regToHost**(): `void`

客户端注册指令，系统调用，不管

#### Returns

`void`

***

### runCommand()

> **runCommand**(`t`): `undefined` \| [`cancel`](../namespaces/Event/enumerations/chatOpe.md#cancel) \| [`skipsend`](../namespaces/Event/enumerations/chatOpe.md#skipsend)

运行命令注册回调

#### Parameters

##### t

`ChatSendBeforeEvent`

#### Returns

`undefined` \| [`cancel`](../namespaces/Event/enumerations/chatOpe.md#cancel) \| [`skipsend`](../namespaces/Event/enumerations/chatOpe.md#skipsend)

***

### runNativeCommand()

> **runNativeCommand**(`command`, `origin`, ...`args`): `undefined` \| `CustomCommandResult`

#### Parameters

##### command

[`Command`](Command.md)

##### origin

`CustomCommandOrigin`

##### args

...`any`[]

#### Returns

`undefined` \| `CustomCommandResult`
