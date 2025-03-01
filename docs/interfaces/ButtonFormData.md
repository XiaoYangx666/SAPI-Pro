[**Documentation**](../README.md)

---

[Documentation](../globals.md) / ButtonFormData

# Interface: ButtonFormData

## Properties

### body?

> `optional` **body**: `string`

---

### buttonGenerator?

> `optional` **buttonGenerator**: [buttonGenerator](buttonGenerator.md)

按钮生成器

---

### buttons?

> `optional` **buttons**: `Record`\<`string`, [FuncButton](FuncButton.md)\>

按钮对象

---

### generator?

> `optional` **generator**: [formGenerator](formGenerator.md)\<ActionFormData\>

自定义生成器，如果只需要按钮可以用按钮生成器

---

### oncancel?

> `optional` **oncancel**: [FormHandler](FormHandler.md)

取消事件

---

### title?

> `optional` **title**: `string`

---

### validator?

> `optional` **validator**: [FormValidator](FormValidator.md)

表单验证器，验证失败则不打开表单

### 示例

```typescript
const clockMenu: ButtonFormData = {
    title: "菜单",
    body: "请选择你要打开的功能",
    buttons: {
        自动整理: {
            icon: "blocks/chest_front",
            func: (p) => {
                return { type: NavType.OPEN_NEW, formId: "sorter.main" };
            },
        },
        玩家互传: {
            icon: "ui/FriendsIcon",
            func: (p) => {
                return { type: NavType.OPEN_NEW, formId: "tpa.main" };
            },
        },
        音乐播放器: {
            icon: "blocks/jukebox_top",
            func: (p) => {
                musicForm(p, 5);
                return undefined;
            },
        },
        //...更多省略...
    },
};
```
