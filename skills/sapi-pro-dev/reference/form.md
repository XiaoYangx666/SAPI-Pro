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

---

# DDUI（CustomForm 响应式表单）

需要滑块/输入框/开关实时联动、页面栈或多页面跳转时优先使用 DDUI，不要手写 `CustomForm` 会话。

```ts
import { DDUI } from "sapi-pro";

const Page = DDUI.page<{ piano: PianoRuntime }>("标题", (ui, args) => {
    const volume = ui.number(100);          // 默认 clientWritable
    const label = ui.computed([volume], () => `音量 ${volume.getData()}%`);

    ui.set(volume, args.piano.volume);      // 服务器同步，不触发 onChange
    ui.onChange(volume, (v) => args.piano.setVolume(v));

    ui.subscribe(args.piano.disposedSignal, () => ui.close());
    ui.onClose(() => args.piano.flush());
    ui.retain(sharedViewModel);             // 关闭时自动 release

    ui.label(label)
      .slider("音量", volume, 0, 200, { step: 1 })
      .button("子页", () => ui.push(ChildPage, { piano: args.piano }))
      .closeButton();
});

DDUI.open(player, Page, { piano });
```

要点：

- 页面关闭时自动释放：Observable 订阅、`ui.subscribe` 的外部信号、`ui.timeout` / `ui.interval`、`ui.retain`。
- 导航：`ui.push / back / replace / reopen / reset / close`，默认 0 tick（下一游戏刻）显示，可按需传 `delay`，禁止再写“关闭 + runTimeout + 重新 open”。
- 传统表单与 DDUI 共用一个表单栈：`ctx.push(dduiPage, args)` 和 `ui.push(CommonForm, args)` 都可用。
- `ui.set()` 用于程序写入（同步服务器状态、纠正越界值），不触发 `ui.onChange`；值不变时不写回。
- `ui.onChange()` 响应其余变化（客户端输入或业务代码直接 `setData`）。
- 控件方法返回 `ui` 本身，链式调用不会绕过按钮保护；需要原生表单用 `ui.form`。
- `DDUI.open()` 会自动关闭该玩家正在显示的旧表单；`UserBusy` 表示本次无法显示，直接结束、不重试。
- 页面构建函数里 `ui.close()` 会取消本次显示，`ui.push()` 可以构建期重定向。
- `DDUI.page()` 的返回值也是 `SAPIProForm`，可以直接 `formManager.open()`。
- 点击跳转后 `ui.closed` 立即为 true，订阅/定时器已释放，异步回调不要再写状态。

详细文档：`tutorial/ddui.md`。

