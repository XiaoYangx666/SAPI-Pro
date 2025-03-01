[**Documentation**](../README.md)

---

[Documentation](../globals.md) / ParamDefinition

# Interface: ParamDefinition

## Extends

-   [`ParamObject`](ParamObject.md)

## Properties

### branches?

> `optional` **branches**: `paramBranches`[]

参数分支

#### Inherited from

[`ParamObject`](ParamObject.md).[`branches`](ParamObject.md#branches)

---

### default?

> `optional` **default**: [`parsedTypes`](../type-aliases/parsedTypes.md)

默认值

#### Inherited from

[`ParamObject`](ParamObject.md).[`default`](ParamObject.md#default)

---

### enums?

> `optional` **enums**: `string`[]

枚举值

#### Inherited from

[`ParamObject`](ParamObject.md).[`enums`](ParamObject.md#enums)

---

### explain?

> `optional` **explain**: `string`

参数解释

#### Inherited from

[`ParamObject`](ParamObject.md).[`explain`](ParamObject.md#explain)

---

### name

> **name**: `string`

参数名

#### Inherited from

[`ParamObject`](ParamObject.md).[`name`](ParamObject.md#name)

---

### optional?

> `optional` **optional**: `boolean`

是否可选，默认否

#### Inherited from

[`ParamObject`](ParamObject.md).[`optional`](ParamObject.md#optional)

---

### subParams?

> `optional` **subParams**: [`ParamDefinition`](ParamDefinition.md)[]

---

### type

> **type**: `"string"` \| `"boolean"` \| `"float"` \| `"position"` \| `"target"` \| `"flag"` \| `"enum"` \| `"int"`

参数类型

#### Inherited from

[`ParamObject`](ParamObject.md).[`type`](ParamObject.md#type)

---

### validator?

> `optional` **validator**: [`ParamValidator`](ParamValidator.md)

参数验证器

#### Inherited from

[`ParamObject`](ParamObject.md).[`validator`](ParamObject.md#validator)
