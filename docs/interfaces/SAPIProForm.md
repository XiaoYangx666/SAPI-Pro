[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / SAPIProForm

# Interface: SAPIProForm\<T, U\>

## Type Parameters

### T

`T` *extends* [`formDataType`](../type-aliases/formDataType.md)

### U

`U` *extends* [`contextArgs`](contextArgs.md) = [`contextArgs`](contextArgs.md)

## Properties

### beforeBuild?

> `optional` **beforeBuild?**: [`formBeforeBuild`](../type-aliases/formBeforeBuild.md)\<`T`, `U`\>

在展示前运行，可用来处理验证或跳转

***

### builder

> **builder**: [`FormBuilder`](../type-aliases/FormBuilder.md)\<`T`, `U`\>

构建函数

***

### handler

> **handler**: [`formHandler`](../type-aliases/formHandler.md)\<`T`, `U`\>

处理函数
