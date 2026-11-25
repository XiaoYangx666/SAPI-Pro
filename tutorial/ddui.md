# DDUI 响应式表单

DDUI 是 `@minecraft/server-ui` 的 `CustomForm` 封装：直接使用原生 Observable 与原生控件，只补齐三件事：

1. 页面级资源托管（订阅、定时器、外部信号、ViewModel 引用自动释放）；
2. 派生状态（`ui.computed` / `ui.watch`，不需要手写多个订阅）；
3. 真正的表单栈（`push` / `back` / `replace` / `reopen` / `reset` / `close`），并和传统表单共用同一个栈。

不需要理解生命周期概念：**页面关闭时，页面里登记的东西都会自动释放**。

---

## 最小例子

```ts
import { DDUI } from "sapi-pro";

export const SettingsPage = DDUI.page<{ save: (volume: number) => void }>(
    "设置",
    (ui, args) => {
        // 默认 clientWritable：绑定到输入控件后可被玩家修改
        const volume = ui.number(100);

        // 服务器写入（不会触发下面的 onChange）
        ui.set(volume, 100);

        // 派生文本：依赖变化时自动重算
        const label = ui.computed([volume], () => `当前音量：${volume.getData()}%`);

        // 玩家输入：关闭页面后不会再执行
        ui.onChange(volume, (value) => args.save(value));

        ui.label(label).slider("音量", volume, 0, 200, { step: 1 });
        ui.closeButton();
    }
);

DDUI.open(player, SettingsPage, { save: (v) => piano.setVolume(v) });
```

---

## 页面与参数

```ts
const page = DDUI.page<Args>("标题", (ui, args) => { ... });
DDUI.open(player, page, args);   // 清空表单栈后打开
ui.push(page, args);             // 入栈打开（可返回）
```

- 标题可以是字符串，也可以是 `(args) => string`。
- `args` 是**同一个对象**：返回上一页时原样传回，适合保存“页面参数”和需要跨页面保留的状态。
- 页面里的 Observable 属于页面：返回后重新构建（重新调用 build），因此页面本地状态会重建。
  需要跨页面保留的状态请写进 `args` 或共享 ViewModel。
- `DDUI.page()` 的返回值同时是一个 `SAPIProForm`，可以直接交给 `formManager.open()`、传统表单的 `ctx.push()`。

---

## 状态 API

| 方法 | 说明 |
|---|---|
| `ui.number(initial)` | 创建 `ObservableNumber`（默认 `clientWritable: true`） |
| `ui.string(initial)` | 创建 `ObservableString` |
| `ui.boolean(initial)` | 创建 `ObservableBoolean` |
| `ui.computed(deps, fn)` | 由其他 Observable 派生的只读 Observable，值不变不写回；依赖必须显式列出，不做自动追踪 |
| `ui.onChange(obs, fn)` | 变化回调（客户端输入或业务代码直接 `setData`）；`ui.set()` 不触发 |
| `ui.watch(deps, fn, immediate?)` | 依赖变化时执行副作用（默认立即执行一次） |
| `ui.set(obs, value)` | 程序写入：不触发 `onChange`，值不变时不写回、不通知 |
| `ui.get(obs)` | 读取当前值 |

`ui.number/string/boolean` 的第二个参数可传 `{ clientWritable: false }`，用于只由服务器更新的值。

> 原生 Observable 只在值真正变化时通知订阅者。因此 `ui.set()` 只需要在写入期间做同步标记，
> 就能把自己触发的回调排除掉；不需要记录“最后写入值”，也不会误吞玩家随后的合法输入。
> **同步服务器状态一律用 `ui.set()`；直接 `setData()` 会被当作一次业务变更。**

---

## 控件

`ui.label / header / toggle / slider / dropdown / textField / image / divider / spacer / button / closeButton`
参数与原生 `CustomForm` 完全一致，返回 `ui` 本身，可以继续链式调用（按钮保护不会因为链式调用丢失）。
需要原生表单对象时使用 `ui.form`。

```ts
ui.label(status)
  .toggle("显示文字", visible, { visible: hasScreen })
  .slider("字号", scale, 25, 250, { step: 1, visible: hasScreen })
  .button("返回", () => ui.back());
```

`ui.button` 的回调自带保护：页面已关闭、或本次显示内已经触发过导航时，后续点击会被忽略（防连点重复入栈）。

---

## 资源托管

```ts
ui.onClose(() => piano.flushSettings(id));      // 关闭时执行一次
ui.subscribe(piano.disposedSignal, () => ui.close());  // 外部 Signal / 事件
ui.timeout(() => { ... }, 5);                  // 关闭自动取消，关闭后不执行
ui.interval(() => { ... }, 20);
ui.own(() => something.dispose());             // 任意清理函数
ui.retain(viewModel);                          // retain() 现在，release() 关闭时
```

- 所有清理按登记顺序倒序执行，单个清理抛错不影响其它清理；重复关闭只执行一次。
- 页面关闭后，`ui.onChange` / `ui.subscribe` 的回调不会再执行。
- **共享对象不会被销毁**：`ui.retain(vm)` 只做引用计数，是否销毁由对象自己的所有者决定。

---

## 导航

| 方法 | 说明 |
|---|---|
| `ui.push(form, args?, delay?)` | 入栈打开（DDUI 页面或传统表单都可以） |
| `ui.back(delay?)` | 返回上一页；栈为空时关闭界面 |
| `ui.replace(form, args?)` | 替换当前页，栈深度不变 |
| `ui.reopen()` | 用当前参数重建当前页 |
| `ui.reset(form, args?)` | 清空栈并打开新页 |
| `ui.close()` | 关闭界面并清空栈 |

```ts
const ScorePage = DDUI.page("曲谱", (ui) => {
    ui.button("返回", () => ui.back());   // 不需要 runTimeout / 重新 open
});
```

- 跳转会先修改表单栈再关闭当前表单，由 `formManager` 在下一个调度点显示目标页（默认 0 tick，即下一游戏刻；需要时可传 `delay`）。
- `UserBusy` 表示本次无法显示，页面直接结束，不自动重试。
- 同一玩家永远只有一个界面：`DDUI.open()` / `formManager.open()` 会先关掉正在显示的旧表单。
- **混合导航**：传统 `CommonForm` 页面里 `ctx.push(dduiPage, args)`，DDUI 页面里 `ui.push(CommonForm, args)`，`back()` 都能正确回到上一页。

```ts
// DDUI → 传统表单
ui.button("点歌", () => ui.push(MidiListForm, { midiPlayer, p: 1 }));

// 传统表单 → DDUI
onSubmit(data, ctx) {
    ctx.push(SomeDDUIPage, { id: data.id });
}
```

> 传统表单回调里不要再用“关闭 + `system.runTimeout` 再打开”的写法，直接入栈即可。

---

## 生命周期与失效

- `show()` 抛异常、玩家离线、表单被强制关闭、`UserBusy` 都是正常结束路径：页面资源会释放，不会抛给调用方，也不会留下显示中的空表单。
- 页面构建函数里调用 `ui.close()` 会取消本次显示；调用 `ui.push()` 会在构建完成后直接显示新页面（适合“目标对象已失效，跳到提示页”）。
- 点击跳转后 `ui.closed` **立即**变为 true，订阅与定时器已经释放；异步回调里应提前退出：

```ts
ui.onChange(search, async (keyword) => {
    const result = await searchRemote(keyword);
    if (ui.closed) return;    // 页面已关闭，别把旧结果写进新页面
    status.setData(result);
});
```

- 迟到的导航不会生效：每次展示都有导航代际，旧 `show()`、旧定时器、被替换页面的回调都被丢弃。

---

## 原生 API 限制

以下结论均对照 `@minecraft/server-ui` 的类型定义（stable 2.3.0 / beta 2.4.0-beta）确认：

- `CustomForm` 构造时需要 `Player` 与标题；`show()` 不接收 `player`，返回 `DataDrivenScreenClosedReason`（`ClientClosed` / `ServerClosed` / `UserBusy`）。失败时抛 `FormVisibilityError`（`reason` 为 `AlreadyShowing` / `NotShowing`）或 `InvalidEntityError`。
- `Observable.setData()` 只有在值真正变化时才通知订阅者；`subscribe()` 返回的是回调本身，用 `unsubscribe(回调)` 退订，没有 `dispose`。
- API 不提供“这次变化来自客户端还是服务端”的来源标识，也没有 `clientWritable` 的运行时查询。
- 传统表单（`ActionFormData` 等）没有服务端 `close()`，只能通过 `uiManager.closeAllForms(player)` 关闭；DDUI 只在重新打开界面时调用它。

> **实现依赖（尚未实机验证）**：`ui.set()` 用“写入期间的同步标记”过滤掉自己触发的回调，前提是 `setData()` 在当前调用栈内同步通知订阅者。类型定义没有写明通知时机；如果实机是异步通知，这套区分方式需要改。

---

## 从手写 Session 迁移

手写模式（每页重复）：

```ts
private cleanups: Array<() => void> = [];
private opening = false;
async show() { this.opening = true; try { await form.show(); } finally { this.opening = false; this.close(); } }
close() { for (const c of this.cleanups.splice(0)) c(); }
```

DDUI 模式：

```ts
DDUI.page("标题", (ui, args) => {
    ui.onChange(value, ...);     // 关闭自动退订
    ui.timeout(..., 20);         // 关闭自动取消
});
DDUI.open(player, page, args);   // 并发、重复打开、异常、离线由框架处理
```
