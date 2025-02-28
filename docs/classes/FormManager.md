[**Documentation**](../README.md)

***

[Documentation](../globals.md) / FormManager

# Class: FormManager

Defined in: [Form/main.ts:156](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Form/main.ts#L156)

## Constructors

### new FormManager()

> **new FormManager**(): [`FormManager`](FormManager.md)

#### Returns

[`FormManager`](FormManager.md)

## Methods

### open()

> `static` **open**(`player`, `formId`, `initialData`?, `delay`?, `isfirst`?): `void`

Defined in: [Form/main.ts:204](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Form/main.ts#L204)

为玩家打开指定ID的表单
需要先注册表单

#### Parameters

##### player

`Player`

##### formId

`string`

##### initialData?

`any`

##### delay?

`number` = `0`

##### isfirst?

`boolean` = `true`

#### Returns

`void`

***

### register()

> `static` **register**(`formData`): `void`

Defined in: [Form/main.ts:159](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Form/main.ts#L159)

注册一个表单

#### Parameters

##### formData

[`FormData`](../interfaces/FormData.md)

#### Returns

`void`

***

### registerAll()

> `static` **registerAll**(`formDatas`): `void`

Defined in: [Form/main.ts:163](https://github.com/XiaoYangx666/SAPI-Pro/blob/f4b3a55bd14c42fce5d687eca57d1987c433a912/src/SAPI-Pro/Form/main.ts#L163)

注册一堆表单

#### Parameters

##### formDatas

[`FormData`](../interfaces/FormData.md)[]

#### Returns

`void`
