[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / ParamObject

# Interface: ParamObject

## Extended by

- [`ParamDefinition`](ParamDefinition.md)

## Properties

### branches?

> `optional` **branches**: [`paramBranches`](../type-aliases/paramBranches.md)[]

参数分支

***

### default?

> `optional` **default**: [`parsedTypes`](../type-aliases/parsedTypes.md)

默认值

***

### enums?

> `optional` **enums**: `string`[]

枚举值

***

### explain?

> `optional` **explain**: `string`

参数解释

***

### name

> **name**: `string`

参数名

***

### optional?

> `optional` **optional**: `boolean`

是否可选，默认否

***

### type

> **type**: `"string"` \| `"boolean"` \| `"float"` \| `"position"` \| `"target"` \| `"flag"` \| `"enum"` \| `"int"`

参数类型

***

### validator?

> `optional` **validator**: [`ParamValidator`](ParamValidator.md)

参数验证器
