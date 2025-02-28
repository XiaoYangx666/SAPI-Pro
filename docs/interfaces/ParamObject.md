[**Documentation**](../README.md)

***

[Documentation](../globals.md) / ParamObject

# Interface: ParamObject

Defined in: [Command/main.ts:45](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L45)

## Extended by

- [`ParamDefinition`](ParamDefinition.md)

## Properties

### branches?

> `optional` **branches**: `paramBranches`[]

Defined in: [Command/main.ts:61](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L61)

参数分支

***

### default?

> `optional` **default**: [`parsedTypes`](../type-aliases/parsedTypes.md)

Defined in: [Command/main.ts:55](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L55)

默认值

***

### enums?

> `optional` **enums**: `string`[]

Defined in: [Command/main.ts:51](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L51)

枚举值

***

### explain?

> `optional` **explain**: `string`

Defined in: [Command/main.ts:57](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L57)

参数解释

***

### name

> **name**: `string`

Defined in: [Command/main.ts:47](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L47)

参数名

***

### optional?

> `optional` **optional**: `boolean`

Defined in: [Command/main.ts:53](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L53)

是否可选，默认否

***

### type

> **type**: `"string"` \| `"boolean"` \| `"float"` \| `"position"` \| `"target"` \| `"flag"` \| `"enum"` \| `"int"`

Defined in: [Command/main.ts:49](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L49)

参数类型

***

### validator?

> `optional` **validator**: [`ParamValidator`](ParamValidator.md)

Defined in: [Command/main.ts:59](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Command/main.ts#L59)

参数验证器
