[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / CompactStructCodec

# Class: CompactStructCodec

`CompactDPDataBase` 使用的纯 schema 编解码器，不依赖 Dynamic Property。

## Constructor

> **new CompactStructCodec**(`fields`)

schema 数组顺序即持久化字段位置。

## Methods

### encode()

> **encode**(`value`): `string`

运行时校验对象字段与类型，然后编码为紧凑 JSON 数组。boolean 存储为 `0` / `1`。

### decode()

> **decode**(`input`): `CompactDecodeResult<T>`

验证 JSON、数组形状、字段数量和字段类型。不会因坏数据直接抛异常，而是返回带错误码的结果。
