# 表单系统 Reference

## Examples

仅在需要实现对应表单时阅读：

- [ConfigForm 示例](../examples/forms/config.md)
- [InputForm / ButtonForm 示例](../examples/forms/dbform.md)
- [ButtonForm 菜单示例](../examples/forms/menu.md)

---

## 基础表单

所有表单均实现：

```ts
interface SAPIProForm<T extends formDataType, U extends contextArgs = contextArgs> {
    builder?: FormBuilder<T, U>;
    handler?: formHandler<T, U>;
    beforeBuild?: formBeforeBuild<T, U>;
}
```

示例：

```ts
const form: SAPIProForm<ActionFormData> = {
    builder(player, args) {
        return new ActionFormData().title("标题").button("确定");
    },

    handler(res, ctx) {},
};
```

---

## 打开表单

```ts
formManager.open(
    player,
    form,
    args?,
    delay?
);
```

具名表单：

```ts
formManager.registerNamed("example.main", form);

formManager.openNamed(player, "example.main");
```

---

## 表单上下文

处理函数中可获取：

```ts
ctx.player;
ctx.args;
```

---

# CommonForm

所有 CommonForm 均返回 `SAPIProForm`。

---

## ButtonForm

最常用的列表表单。

适用于：

```text
菜单
列表选择
分页列表
玩家列表
数据库浏览器
```

参考：

```text
examples/forms/menu.md
examples/forms/dbform.md
```

---

## BodyInfoForm

简单信息展示页面。

```ts
CommonForm.BodyInfoForm(title, body);
```

---

## SimpleMessageForm

确认对话框。

```ts
CommonForm.SimpleMessageForm({
    title,
    body,
    button1,
    button2,
});
```

---

## InputForm

用于收集用户输入。

支持字段：

```ts
TextField;
NumberField;
SliderField;
ToggleField;
DropDownField;
```

参考：

```text
examples/forms/dbform.md
```

---

## ConfigForm

声明式配置表单。

```ts
CommonForm.ConfigForm().create(schema, options);
```

适用于：

```text
插件配置
玩家设置
管理面板
```

参考：

```text
examples/forms/config.md
```

---

## 生命周期

```text
beforeBuild
    ↓
builder
    ↓
handler
```
