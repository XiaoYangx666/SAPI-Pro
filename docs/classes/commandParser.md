[**Documentation**](../README.md)

***

[Documentation](../globals.md) / commandParser

# Class: commandParser

Defined in: Command/main.ts:220

## Constructors

### new commandParser()

> **new commandParser**(): [`commandParser`](commandParser.md)

Defined in: Command/main.ts:222

#### Returns

[`commandParser`](commandParser.md)

## Properties

### commands

> **commands**: `Map`\<`string`, [`Command`](Command.md)\>

Defined in: Command/main.ts:221

## Methods

### getCommandInfo()

> **getCommandInfo**(`command`): `undefined` \| [`Command`](Command.md)

Defined in: Command/main.ts:462

#### Parameters

##### command

`string`

#### Returns

`undefined` \| [`Command`](Command.md)

***

### getCommandsList()

> **getCommandsList**(`admin`): `string`[]

Defined in: Command/main.ts:465

#### Parameters

##### admin

`boolean`

#### Returns

`string`[]

***

### parseCommand()

> **parseCommand**(`input`, `player`): [`chatOpe`](../namespaces/Event/enumerations/chatOpe.md)

Defined in: Command/main.ts:270

直接解析一条命令

#### Parameters

##### input

`string`

##### player

`Player`

#### Returns

[`chatOpe`](../namespaces/Event/enumerations/chatOpe.md)

***

### regClientCommand()

> **regClientCommand**(): `void`

Defined in: Command/main.ts:246

注册客户端命令(系统调用，不用管)

#### Returns

`void`

***

### registerCommand()

> **registerCommand**(`command`): `void`

Defined in: Command/main.ts:228

注册命令

#### Parameters

##### command

[`Command`](Command.md)

#### Returns

`void`

***

### regToHost()

> **regToHost**(): `void`

Defined in: Command/main.ts:238

客户端注册指令

#### Returns

`void`

***

### runCommand()

> **runCommand**(`t`): `undefined` \| [`cancel`](../namespaces/Event/enumerations/chatOpe.md#cancel) \| [`skipsend`](../namespaces/Event/enumerations/chatOpe.md#skipsend)

Defined in: Command/main.ts:263

运行命令注册回调

#### Parameters

##### t

`ChatSendBeforeEvent`

#### Returns

`undefined` \| [`cancel`](../namespaces/Event/enumerations/chatOpe.md#cancel) \| [`skipsend`](../namespaces/Event/enumerations/chatOpe.md#skipsend)

***

### ErrorMessage()

> `static` **ErrorMessage**(`player`, `command`, `value`, `params`, `current`, `tip`?): `void`

Defined in: Command/main.ts:450

#### Parameters

##### player

`Player`

##### command

[`Command`](Command.md)

##### value

`string`

##### params

`string`[]

##### current

`number`

##### tip?

`string`

#### Returns

`void`
