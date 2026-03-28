[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / formHandler

# Type Alias: formHandler\<T, TArgs\>

> **formHandler**\<`T`, `TArgs`\> = (`response`, `context`) => `void` \| `Promise`\<`void`\>

## Type Parameters

### T

`T` *extends* [`formDataType`](formDataType.md)

### TArgs

`TArgs` *extends* [`contextArgs`](../interfaces/contextArgs.md)

## Parameters

### response

[`formResponseType`](formResponseType.md)\<`T`\>

### context

[`SAPIProFormContext`](../classes/SAPIProFormContext.md)\<`T`, `TArgs`\>

## Returns

`void` \| `Promise`\<`void`\>
