[**Documentation**](../README.md)

---

[Documentation](../globals.md) / SimpleMessageFormData

# Interface: SimpleMessageFormData

简单双选信息框

## Properties

### body?

> `optional` **body**: `string`

---

### button1?

> `optional` **button1**: `string`

---

### button2?

> `optional` **button2**: `string`

---

### generator()?

> `optional` **generator**: (`form`, `player`, `context`) => `void`

#### Parameters

##### form

`MessageFormData`

##### player

`Player`

##### context

[`context`](context.md)

#### Returns

`void`

---

### handler

> **handler**: [`FormHandler`](FormHandler.md)

---

### title?

> `optional` **title**: `string`

## 示例

```typescript
CommonForm.SimpleMessageForm("res.remove.confirm", {
    title: "删除领地",
    button1: "确定",
    button2: "取消",
    generator: (form, p, context) => {
        form.body("你确定要删除领地:" + context.item.rname + "吗？");
    },
    handler: (player, res: MessageFormResponse, context) => {
        if (res.selection && res.selection == 0) {
            player.sendMessage(res.selection.toString());
        }
        return { type: NavType.RESET_OPEN, formId: "res.main" };
    },
});
```
