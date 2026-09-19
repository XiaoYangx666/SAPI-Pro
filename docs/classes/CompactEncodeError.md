[**sapi-pro**](../README.md)

***

[sapi-pro](../globals.md) / CompactEncodeError

# Class: CompactEncodeError

## Extends

- `TypeError`

当 `CompactStructCodec.encode()` / `CompactDPDataBase.set()` 收到不符合 schema 的值时抛出。

## Properties

### field?

> **field?**: `string`

若错误对应具体字段，则包含字段名。
