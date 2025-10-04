[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / formResponseType

# Type Alias: formResponseType\<T\>

> **formResponseType**\<`T`\> = `T` *extends* `MessageFormData` ? `MessageFormResponse` : `T` *extends* `ModalFormData` ? `ModalFormResponse` : `T` *extends* `ActionFormData` ? `ActionFormResponse` : `never`

## Type Parameters

### T

`T` *extends* [`formDataType`](formDataType.md)
