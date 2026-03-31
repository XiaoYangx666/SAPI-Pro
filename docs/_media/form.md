**Documentation**

---

## 表单系统

### 目录

- [SAPI-Pro 表单](#sapi-pro-表单)
    - [示例](#实际示例)
    - [注册具名表单](#注册具名表单)
- [表单上下文](#表单上下文-sapiproformcontext)
- [常用表单](#常用表单-commonform)
    - [ButtonForm](#commonformbuttonform-通用按钮表单)
    - [BodyInfoForm](#commonformbodyinfoform)
    - [SimpleMessageForm](#commonformsimplemessageform)
    - [InputForm](#commonforminputform)
    - [ConfigForm](#commonformconfigform)
- [多层表单处理](#使用上下文处理多层表单)

### SAPI-Pro 表单

所有表单均基于 [SAPIProForm<T, U>](../docs/interfaces/SAPIProForm.md) 接口构建。

- `T`: 表单类型（`ActionFormData | ModalFormData | MessageFormData`）。

- `U`: 上下文参数类型（必须继承自 `contextArgs`）。

##### 示例

```typescript
interface MyArgs extends contextArgs {
    score: number;
}

const myForm: SAPIProForm<ActionFormData, MyArgs> = {
    builder: (player, args) => {
        // args 类型为 MyArgs
        return new ActionFormData()
            .title("分数查询")
            .body(`你的分数是: ${args.score}`)
            .button("确定");
    },
    handler: async (res, ctx) => {
        // ctx.args 同样为 MyArgs
        console.log(ctx.args.score);
    },
};
```

#### builder:[FormBuiler](../docs/type-aliases/FormBuilder.md)

`FormBuilder: (player, args) => Promise<T> | T`

builder 需要提供一个创建函数，每次都会使用它来创建表单。创建时会传入 player 和 args(上下文参数)返回值必须是 ActionFormData | ModalFormData | MessageFormData 的其中一个。

你可以为上下文参数设置属性如:`args.a=1`，这样你就可以在 handler 里拿到。

#### handler:[formHandler](../docs/type-aliases/formHandler.md)

`formHandler: (response: formResponseType<T>, context: SAPIProFormContext<T, U>) => void | Promise<void>`

**参数**：第一个参数是表单返回值，它和你的表单类型有关，例如:ActionFormData 将会返回 ActionFormResponse ; 第二个参数是上下文，你可以通过它进行导航，获得玩家等，具体后面介绍。

#### beforeBuild?[formBeforeBuild](../docs/type-aliases/formBeforeBuild.md)

`formBeforeBuild: (context: SAPIProFormContext<T, U>) => void | Promise<void>`

它将在表单已入栈、builder 被执行前执行。此时你可以拿到 context，可以在其中执行自定义验证逻辑，并执行跳转。如果跳转，则 builder 不会被执行。不进行导航操作则会正常构建表单。

可以使用 formManager.open 来打开表单

```typescript
formManager.open<T extends formDataType, U extends contextArgs>(
    player: Player,
    form: SAPIProForm<T, U>,
    args?: U,
    delay = 0
)
/*
player:玩家对象
form:表单对象
args:表单上下文初始参数
delay:打开延迟(单位tick)
*/
```

以下是[简单假人](https://gitee.com/ykxyx666_admin/simple-sp)UI 中的部分代码，使用了基础表单来创建。

##### 实际示例

```typescript
const spCreate: SAPIProForm<ModalFormData> = {
    builder: async (player, context) => {
        const form = new ModalFormData()
            .title("创建假人")
            .textField("假人名字", "输入假人名字，不能有特殊字符");
        return form;
    },
    handler: (res: ModalFormResponse, ctx) => {
        //获取当前玩家
        const player = ctx.player;
        if (res.formValues == undefined) return; //提前返回
        const name = res.formValues[0] as string; //获取玩家填写内容
        //执行验证
        const validation = spNameValidator(name, player);
        if (validation == true) {
            //生成假人
        } else {
            spManager.mes(player, validation); //报错
            return ctx.reopen(); //重新打开
        }
    },
};
```

#### 注册具名表单

表单多数是无名的，可以直接通过对象打开，但如果需要在多行为包间打开表单，则需要为表单命名。

使用[formManager.registerNamed](../docs/classes/FormManagerClass.md#registernamed) 来注册具名表单

使用[formManager.openNamed](../docs/classes/FormManagerClass.md#opennamed) 来打开具名表单

### 表单上下文 SAPIProFormContext

参考:[SAPIProFormContext](../docs/classes/SAPIProFormContext.md)

`SAPIProFormContext<T, U>` 是表单处理的核心，提供了导航和数据访问能力。

#### 参数

`player:Player`
获取当前的玩家
`args:U`
获取当前表单的上下文参数，一般是上个表单传递的（泛型 U 提供了完整类型推断）

#### 方法(此处只介绍几种)

`push(form: SAPIProForm<T, TArgs>, args?: TArgs, delay = 0)`
打开新表单，并加入堆栈

`pushNamed(name: string, args?: contextArgs, delay = 0)`
打开具名表单

`back(delay = 0)`
返回上一层

`reopen(delay = 0)`
重新打开当前表单（刷新）

`replace(form: SAPIProForm<T, TArgs>, args?: TArgs, delay = 0)`
替换当前表单

`offAll(form: SAPIProForm<T, TArgs>, args?: TArgs, delay = 0)`
清空堆栈，打开表单

---

### 常用表单 CommonForm

我们经常会用到一些相似结构的表单，常用表单可以轻松帮助你实现。它们返回实现了 `SAPIProForm` 的实例，并且全面支持泛型和多语言。

#### CommonFormData

以下所有的常用表单定义数据都继承了[CommonFormData](../docs/interfaces/CommonFormData.md)。`CommonForm`中的`generator`在表单构建后被调用，用于动态生成title与body。

```typescript
interface CommonFormData<T extends formDataType, U extends contextArgs = contextArgs> {
    /**标题 */
    title?: TextType;
    /**自定义生成器 */
    generator?: formGenerator<T, U>;
}
```

> 提示: 不要用generator来生成按钮等，否则会和原有逻辑冲突

### CommonForm.ButtonForm 通用按钮表单

ButtonForm 是最常用的组件，支持静态按钮、动态生成列表以及下标索引处理。

```ts
ButtonForm<U>(data: ButtonFormData<U>): ButtonForm<U>;
```

参考：[ButtonFormData](../docs/interfaces/ButtonFormData.md)

#### 按钮处理逻辑

`ButtonForm` 的按钮由两部分组成：

- 静态按钮 (buttons): 在数组中定义的按钮。如果带有 func 属性，点击后会直接触发该回调，不进入全局 handler。

- 动态按钮 (buttonGenerator): 每次构建表单时动态生成的按钮列表。

#### buttons 静态按钮

##### 示例

```typescript
const clockMenu = CommonForm.ButtonForm({
    title: clockMenuText.title, // "菜单"
    body: clockMenuText.body,
    buttons: [
        {
            icon: "ui/FriendsIcon",
            label: clockMenuText.tpa, // "玩家传送"
            func: (ctx) => {
                ctx.pushNamed("tpa.main");
            },
        },
        {
            icon: "ui/recipe_book_icon.png",
            label: clockMenuText.statistics, // "统计信息"
            func: (ctx) => {
                ctx.push(statisticsForm);
            },
        },
        {
            icon: "gui/newgui/Language18.png",
            label: clockMenuText.langSetting, // "语言设置"
            func: (ctx) => {
                ctx.push(LangSettingForm);
            },
        },
    ],
});
```

icon不用写完整路径，从`textures/`后开始写即可。
label支持字符串、翻译对象及RawMessage
func用于自定义回调，当点击的按钮有func属性时，则会直接触发func回调，而不会触发handler。

#### buttonGenerator 动态生成按钮

```typescript
buttonGenerator: (player, args, t) => Iterable<FuncButton<U, TData>>;
```

通过 buttonGenerator可以动态生成按钮，返回的按钮数组被添加在buttons后面。

##### 示例

```typescript
const DbInfoForm = new ButtonForm<{
    db: DataBase<any>;
    keys?: string[];
    participants?: ScoreboardIdentity[];
}>({
    title: "数据库详情",
    // 构建表单（每次打开都会执行）
    generator(form, p, args) {
        const db = args.db;

        // 缓存数据给后续 handler 使用
        const keys = db.keys();
        args.keys = keys;

        const rows = [`数据库名称:${db.name}`, `类型:${db.type}`, `总键数:${keys.length}`];

        if (db instanceof ScoreBoardDataBase) {
            rows.push(`计分板名:${db.getScoreBoardName()}`);
            args.participants = db.participants(); // 与 keys 对应
        }

        form.body(rows.join("\n"));
    },
    // 固定按钮（优先执行 func，不走 handler）
    buttons: [
        {
            label: "设置键值",
            func(ctx) {
                ctx.push(setValuePage, { db: ctx.args.db });
            },
        },
    ],
    // 动态按钮（对应每个 key）
    buttonGenerator(player, args, t) {
        return args.keys!.map((k) => ({ label: k, data: k }));
    },
    oncancel(res, ctx) {
        ctx.back();
    },
    // 处理动态按钮点击（btnIndex 只计算无 func 的按钮）
    handler(ctx, btn) {
        const args = ctx.args;

        const key = args.keys![btn.btnIndex];
        const identity = args.participants?.[btn.btnIndex];

        ctx.push(DbValuePage, {
            db: args.db,
            key: identity ?? key, // 计分板优先
        });
    },
});
```

例子中使用 buttonGenerator 来直接生成动态的key按钮，并通过buttons添加了静态按钮。

### CommonForm.BodyInfoForm

一个只有标题，body 和一个确认按钮的表单,用于显示简单的文本信息。

```typescript
BodyInfoForm<U extends ButtonFormArgs>(
    title: TextType,
    body: formGenerator<ActionFormData, U> | TextType,
    onSubmit?: (ctx: SAPIProFormContext<ActionFormData, U>) => void
)
```

传入title,body。其中 body 可以传TextType 或 formGenerator。对于静态表单，直接传文本即可。如果需要内容动态生成，那么可以使用formGenerator。

点击确认后默认返回上一级，可以通过传入onSubmit参数自定义处理。

##### 示例

```typescript
const promptPage = CommonForm.BodyInfoForm("AIChat系统提示词", (form, player, args) => {
    form.body(Prompts[Config.systemPrompt]);
});
```

### CommonForm.SimpleMessageForm

一个简单的对话框，用户只需要选择是或不是。

`CommonForm.SimpleMessageForm(data: SimpleMessageFormData)`

其中 [SimpleMessageFormData](../docs/interfaces/SimpleMessageFormData.md) 定义如下:

```ts
interface SimpleMessageFormData<U extends contextArgs = contextArgs> extends CommonFormData<
    MessageFormData,
    U
> {
    /**body */
    body?: TextType;
    button1?: MessageFormButton<U>;
    button2?: MessageFormButton<U>;
}
```

button1，button2 就是对话框的俩按钮，每个都有独立的处理函数和文本，会在点击后执行。默认情况下不会执行任何操作(表单直接关闭)。

```ts
interface MessageFormButton<U extends contextArgs> {
    text: TextType;
    /**按钮点击事件 */
    func: (context: SAPIProFormContext<MessageFormData, U>) => void | Promise<void>;
}
```

body和title等可以静态也可以通过 generator 来生成。

##### 示例

```typescript
CommonForm.SimpleMessageForm({
    title: "确认删除",
    body: "你确定要删除这个领地吗？此操作不可逆。",
    button1: {
        text: "确定删除",
        func: (ctx) => {
            // 处理删除逻辑
            ctx.player.sendMessage("领地已删除");
        },
    },
    button2: {
        text: "取消",
        func: (ctx) => ctx.back(),
    },
});
```

### CommonForm.InputForm

`InputForm` 用于构建输入的表单界面，通过 ValueField 实现数据自动解析和校验。

参考:[InputFormData](../docs/interfaces/InputFormData.md)

#### 核心 Field 组件

- `TextField(label, placeholder, defaultValue?)`

- `NumberField(label, placeholder, defaultValue?)` - 自动解析为数字。

- `SliderField(label, min, max, step, defaultValue?)`

- `ToggleField(label, defaultValue?)`

- `DropDownField(label, options, defaultIndex?)`

#### 数据绑定与校验

每个 ValueField 都可以使用 .key() 绑定键名，并使用 .validator() 进行链式校验。

##### 示例

```typescript
interface AIChatConfig {
    model: number;
    systemPrompt: number;
    max_turns: number;
    showThink: boolean;
    includeChat: boolean;
    chat_length: number;
}

const configPage = CommonForm.InputForm<AIChatConfig, { models: string[]; prompts: string[] }>({
    title: "AI聊天设置",
    fields: [],
    fieldsGenerator(p, args) {
        args.models = Object.keys(models);
        args.prompts = Object.keys(Prompts);
        const config = Config;
        return [
            new DropDownField(
                "模型选择",
                Object.entries(models).map(
                    (t) => `${t[0]}(${t[1].provider ?? "unknown"})`,
                    args.models.indexOf(config.model)
                ),
                args.models.indexOf(config.model)
            ).key("model"),
            new DropDownField(
                "系统提示词",
                args.prompts,
                args.prompts.indexOf(config.systemPrompt)
            ).key("systemPrompt"),
            new SliderField("最大历史记录轮数", 5, 30, {
                defaultValue: config.max_turns,
                step: 1,
            }).key("max_turns"),
            new ToggleField("显示思考过程", config.showThink).key("showThink"),
            new ToggleField("包含历史聊天记录", config.includeChat).key("includeChat"),
            new SliderField("聊天记录条数", 5, 30, {
                defaultValue: config.chat_length,
            }).key("chat_length"),
        ];
    },
    onSubmit(data, ctx) {
        const config: globalConfig = {
            ...data,
            model: ctx.args.models[data.model],
            systemPrompt: ctx.args.prompts[data.systemPrompt],
        };
        Object.assign(Config, config);
        Configdb.setJSON("aichat", config);
        ctx.back();
    },
});
```

### CommonForm.ConfigForm

参考:[ConfigForm](../docs/interfaces/ConfigFormOptions.md)

`ConfigForm` 是 `InputForm` 的高级声明式封装。它通过一个配置对象（Schema）自动生成表单字段、处理动态默认值、执行字段级逻辑（Setter）并提供完美的类型推导，非常适合用于制作插件配置、玩家设置等界面。

#### 字段类型 (FieldType)

- `FieldType.String` - 对应 `TextField`。支持 `optional`。
- `FieldType.Number` - 对应 `NumberField`。支持 `optional`。
- `FieldType.Boolean` - 对应 `ToggleField`。**始终必选**。
- `FieldType.Slider` - 对应 `SliderField`。**始终必选**。
- `FieldType.Dropdown` - 对应 `DropDownField`。**始终必选**。

#### 示例

```typescript
interface MyArgs extends InputFormArgs {
    isVip: boolean;
}

// 1. 使用 CommonForm.config<U>() 开启链式调用并注入 Args 类型
const settingsForm = CommonForm.ConfigForm<MyArgs>().create(
    {
        // 字符串字段
        nickname: {
            type: FieldType.String,
            label: (p) => `修改昵称 (当前: ${p.name})`,
            placeholder: "输入新昵称...",
            defaultValue: (p) => p.nameTag,
            optional: true, // result.nickname 将推导为 string | undefined
            setter: (val, p) => (p.nameTag = val), // 提交时自动修改玩家名
        },
        // 数字字段
        age: {
            type: FieldType.Number,
            label: "玩家年龄",
            defaultValue: 18,
            validators: [(v) => (v < 0 ? "年龄不能为负数" : undefined)],
        },
        // 下拉框字段
        skinType: {
            type: FieldType.Dropdown,
            label: "皮肤选择",
            items: ["经典", "苗条", "自定义"],
            defaultValue: 0,
        },
        // 滑块字段
        particleScale: {
            type: FieldType.Slider,
            label: "粒子大小",
            min: 1,
            max: 10,
            defaultValue: (p, args) => (args.isVip ? 5 : 1), // 根据 Args 动态决定默认值
        },
        // 开关字段
        autoSave: {
            type: FieldType.Boolean,
            label: "自动保存配置",
            defaultValue: true,
        },
    },
    {
        title: "玩家个人设置",
        // 初始值对象：优先级高于字段定义的 defaultValue，适合从数据库加载
        initialValues: (player, args) => {
            return {
                autoSave: true,
                skinType: 1,
            };
        },
        onSubmit(result, player, ctx) {
            // result 的类型已由 Simplify 自动展开为：
            // { nickname?: string, age: number, skinType: number, particleScale: number, autoSave: boolean }
            player.sendMessage(`§a设置已保存！新年龄: ${result.age}`);

            // 注意：各个字段定义的 setter 也会在此之前被自动调用
        },
        onCancel(player, ctx) {
            player.sendMessage("您取消了配置修改");
        },
    }
);
```

#### 配置参数说明 (ConfigFormOptions)

| 参数名          | 类型                            | 说明                                               |
| :-------------- | :------------------------------ | :------------------------------------------------- |
| `title`         | `Dynamic<TextType, U>`          | 表单标题，支持函数。                               |
| `submitButton`  | `Dynamic<TextType, U>`          | 提交按钮文本（可选）。                             |
| `initialValues` | `Dynamic<Partial<Result>, U>`   | 覆盖所有字段默认值的初始对象，常用于加载已有配置。 |
| `onSubmit`      | `(result, player, ctx) => void` | 全局提交回调，参数 `result` 具有精确的类型推导。   |
| `onCancel`      | `(player, ctx) => void`         | 玩家关闭表单时的回调。                             |

---

### 使用上下文处理多层表单

表单上下文非常有用，设想一下：一个领地管理的 UI 中，有多层级的页面如下。

```
1领地列表-->2领地详情-->3领地好友列表-->4删除领地好友
```

第一层：页面只需知道玩家是谁
第二层：需要知道选择的领地
第三层：也需要选择的领地
第四层：需要知道领地+好友

使用原版方法，管理这多层信息，并处理层级返回、跳转等可能变得略显复杂。使用 formManager 表单上下文可以很方便的管理这些参数。

1.在打开第一层表单时，玩家的上下文栈被清空，并设置为初始上下文(空)。

```typescript
//打开第一层
formManager.open(player, resListForm, {}, 10);
```

第一层选择了领地后，打开第二层

```typescript
//第一层->第二层
const resListForm = CommonForm.ButtonListForm({
    title: "领地列表",
    body: "请选择你要查看的领地",
    generator: (form, player, args) => {
        //略
    },
    handler: (selection, context) => {
        if (selection == 0) {
            return context.back();
        }
        return context.push(resInfoForm, { item: context.args.resList[selection - 1] });
    },
});
```

此处将新页面的上下文设为了选中的领地，然后打开了新的页面`resInfoForm`。第二层打开第三层时 contextData 没有变化，因此直接复制。

```typescript
//第二层->第三层
ctx.push(FriendListForm, { item: ctx.args.item });
```

接下来是第四层，玩家选择了要删除的好友。

```typescript
//第三层->第四层
const FriendListForm = CommonForm.ButtonListForm({
    title: "领地好友",
    body: "请选择你要删除的好友",
    generator: async (form, player, args) => {
        //略
    },
    handler: (selection, context) => {
        if (selection == 0) {
            context.back();
        } else {
            const item = context.args.item as resBBox;
            context.push(deleteFriendConfirmForm, {
                item: item,
                fname: resData.getPlayerName(item.fid[selection - 1]),
            }); //复制item并新增选中的fname
        }
    },
});
```

可以看到传递了 item 和 fname 到下一层表单。

至此，该玩家上下文栈为:

```typescript
[
    SAPIProFormContext(_form:resListForm,args:{}),
    SAPIProFormContext(_form:resInfoForm,args:{item:xxx}),
    SAPIProFormContext(_form:FriendListForm,args:{item:xxx}),
    SAPIProFormContext(_form:deleteFriendConfirmForm,args:{item:xxx,fname:xxx}),
]
```

每一层表单都获取到了所需要的数据(第一层中 resList 是在 builder 中设置的，用于传递给 handler)

此时如果要返回，那么就可以直接弹出第四层的，我们仍然可以拿到第三层的表单对象及其 args，第三层仍然可以正常显示。第二层也同样。
