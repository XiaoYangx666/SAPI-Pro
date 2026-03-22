[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / CommandManager

# Class: CommandManager

## Constructors

### Constructor

> **new CommandManager**(`parser`): `CommandManager`

#### Parameters

##### parser

`CommandParser`

#### Returns

`CommandManager`

## Properties

### commands

> **commands**: `Map`\<`string`, [`Command`](Command.md)\>

***

### nativeCommands

> **nativeCommands**: [`Command`](Command.md)[] = `[]`

***

### testMode

> **testMode**: `boolean` = `false`

## Methods

### registerNative()

> **registerNative**(`command`): `void`

注册原生指令

#### Parameters

##### command

[`Command`](Command.md)

#### Returns

`void`

***

### runNativeCommand()

> **runNativeCommand**(`command`, `origin`, ...`args`): `CustomCommandResult` \| `undefined`

#### Parameters

##### command

[`Command`](Command.md)

##### origin

`CustomCommandOrigin`

##### args

...`any`[]

#### Returns

`CustomCommandResult` \| `undefined`
