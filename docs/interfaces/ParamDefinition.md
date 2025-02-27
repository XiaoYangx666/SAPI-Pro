[**Documentation**](../README.md)

***

[Documentation](../globals.md) / ParamDefinition

# Interface: ParamDefinition

Defined in: Command/main.ts:63

## Extends

- [`ParamObject`](ParamObject.md)

## Properties

### branches?

> `optional` **branches**: `paramBranches`[]

Defined in: Command/main.ts:61

参数分支

#### Inherited from

[`ParamObject`](ParamObject.md).[`branches`](ParamObject.md#branches)

***

### default?

> `optional` **default**: [`parsedTypes`](../type-aliases/parsedTypes.md)

Defined in: Command/main.ts:55

默认值

#### Inherited from

[`ParamObject`](ParamObject.md).[`default`](ParamObject.md#default)

***

### enums?

> `optional` **enums**: `string`[]

Defined in: Command/main.ts:51

枚举值

#### Inherited from

[`ParamObject`](ParamObject.md).[`enums`](ParamObject.md#enums)

***

### explain?

> `optional` **explain**: `string`

Defined in: Command/main.ts:57

参数解释

#### Inherited from

[`ParamObject`](ParamObject.md).[`explain`](ParamObject.md#explain)

***

### name

> **name**: `string`

Defined in: Command/main.ts:47

参数名

#### Inherited from

[`ParamObject`](ParamObject.md).[`name`](ParamObject.md#name)

***

### optional?

> `optional` **optional**: `boolean`

Defined in: Command/main.ts:53

是否可选，默认否

#### Inherited from

[`ParamObject`](ParamObject.md).[`optional`](ParamObject.md#optional)

***

### subParams?

> `optional` **subParams**: [`ParamDefinition`](ParamDefinition.md)[]

Defined in: Command/main.ts:64

***

### type

> **type**: `"string"` \| `"boolean"` \| `"float"` \| `"position"` \| `"target"` \| `"flag"` \| `"enum"` \| `"int"`

Defined in: Command/main.ts:49

参数类型

#### Inherited from

[`ParamObject`](ParamObject.md).[`type`](ParamObject.md#type)

***

### validator?

> `optional` **validator**: [`ParamValidator`](ParamValidator.md)

Defined in: Command/main.ts:59

参数验证器

#### Inherited from

[`ParamObject`](ParamObject.md).[`validator`](ParamObject.md#validator)
