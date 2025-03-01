[**Documentation**](../README.md)

---

[Documentation](../globals.md) / commandParser

# Class: commandParser

命令解析类，要注册命令，请使用类的实例[pcommand](../variables/pcommand.md)。

## 常用函数

[registerCommand](#registercommand)

## Constructors

### new commandParser()

> **new commandParser**(): [`commandParser`](commandParser.md)

#### Returns

[`commandParser`](commandParser.md)

## Properties

### commands

> **commands**: `Map`\<`string`, [`Command`](Command.md)\>

## Methods

### getCommandInfo()

> **getCommandInfo**(`command`): `undefined` \| [`Command`](Command.md)

根据命令名获取注册的命令对象

#### Parameters

##### command

`string`

#### Returns

`undefined` \| [`Command`](Command.md)

---

### getCommandsList()

> **getCommandsList**(`admin`): `string`[]

获取已注册的命令列表(只支持获取本包的，若是主机，则可以获取全部)

#### Parameters

##### admin

`boolean`

#### Returns

`string`[]

---

### parseCommand()

> **parseCommand**(`input`, `player`): [`chatOpe`](../namespaces/Event/enumerations/chatOpe.md)

直接解析一条命令

#### Parameters

##### input

`string`

##### player

`Player`

#### Returns

[`chatOpe`](../namespaces/Event/enumerations/chatOpe.md)

---

### regClientCommand()

> **regClientCommand**(): `void`

注册客户端命令(用于多包互通，不用管)

#### Returns

`void`

---

### registerCommand()

> **registerCommand**(`command`): `void`

注册命令

#### Parameters

##### command

[`Command`](Command.md)

#### Returns

`void`

---

### regToHost()

> **regToHost**(): `void`

客户端注册指令

#### Returns

`void`

---

### runCommand()

> **runCommand**(`t`): `undefined` \| [`cancel`](../namespaces/Event/enumerations/chatOpe.md#cancel) \| [`skipsend`](../namespaces/Event/enumerations/chatOpe.md#skipsend)

运行命令注册回调(系统调用)

#### Parameters

##### t

`ChatSendBeforeEvent`

#### Returns

`undefined` \| [`cancel`](../namespaces/Event/enumerations/chatOpe.md#cancel) \| [`skipsend`](../namespaces/Event/enumerations/chatOpe.md#skipsend)

---

### ErrorMessage()

> `static` **ErrorMessage**(`player`, `command`, `value`, `params`, `current`, `tip`?): `void`

命令错误提示

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
