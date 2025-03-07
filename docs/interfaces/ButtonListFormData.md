[**Documentation**](../README.md)

---

[Documentation](../globals.md) / ButtonListFormData

# Interface: ButtonListFormData

## Properties

### body?

> `optional` **body**: `string`

---

### generator?

> `optional` **generator**: [`formGenerator`](formGenerator.md)\<`ActionFormData`\>

---

### handler

> **handler**: [`ListFormHandler`](ListFormHandler.md)

---

### oncancel?

> `optional` **oncancel**: [`FormHandler`](FormHandler.md)

---

### title?

> `optional` **title**: `string`

---

### validator?

> `optional` **validator**: [`FormValidator`](FormValidator.md)

### 示例

```typescript
CommonForm.ButtonListForm("sp.list", {
    title: "假人列表",
    generator: (form, player, context) => {
        const spList = spManager.getSPList();
        form.button("返回");
        for (let spdata of spList) {
            form.button(spdata.sp.name);
        }
        context.list = spList;
    },
    handler: (player, selection, context) => {
        if (selection == 0) return { type: NavType.BACK };
        return { type: NavType.OPEN_NEW, formId: "sp.info", contextData: { spdata: context.list[selection - 1] } };
    },
    validator: (player, context) => {
        if (spManager.getSPList().length == 0) {
            spManager.mes(player, "没有假人，请先创建");
            return { type: NavType.BACK };
        }
        return true;
    },
});
```
