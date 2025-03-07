[**Documentation**](../README.md)

---

[Documentation](../globals.md) / FormManager

# Class: FormManager

表单管理类

## Methods

### open()

> `static` **open**(`player`, `formId`, `initialData`?, `delay`?, `isfirst`?): `void`

为玩家打开指定 ID 的表单,需要先注册表单

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

---

### register()

> `static` **register**(`formData`): `void`

注册一个表单

#### Parameters

##### formData

[`FormData`](../interfaces/FormData.md)

#### Returns

`void`

#### 示例

```typescript
import { ActionFormData } from "@minecraft/server-ui";
import { FormManager } from "SAPI-Pro/Form/main";
import { ActionFormResponse } from "@minecraft/server-ui";
FormManager.register({
    id: "test.main",
    builder: (player, ctx) => {
        const form = new ActionFormData().title("测试").body("测试啊测试啊测试啊").button("已阅");
        return form;
    },
    handler: (player, res: ActionFormResponse, ctx) => {},
    validator: (player, ctx) => {
        return true;
    },
});
```

---

### registerAll()

> `static` **registerAll**(`formDatas`): `void`

注册一堆表单

#### Parameters

##### formDatas

[`FormData`](../interfaces/FormData.md)[]

#### Returns

`void`
