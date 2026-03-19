**Documentation**

---

> 此文档纯手工编辑，未使用 AI

## 表单系统

### 目录

- [SAPI-Pro 表单](#sapi-pro-表单)
    - [示例](#实际示例)
    - [注册具名表单](#注册具名表单)
- [表单上下文](#表单上下文-sapiproformcontext)
- [常用表单](#常用表单)
    - [ButtonForm](#commonformbuttonform-通用按钮表单)
    - [BodyInfoForm](#commonformbodyinfoform)
    - [SimpleMessageForm](#commonformsimplemessageform)
    - [InputForm](#)
- [多层表单处理](#使用上下文处理多层表单)

### SAPI-Pro 表单

SAPI-Pro 表单使用接口[SAPIProForm](../docs/interfaces/SAPIProForm.md)构建，指定表单类型，即可构建表单。

##### 示例

```typescript
import { ActionFormData } from "@minecraft/server-ui";
import { formManager } from "sapi-pro";
import { ActionFormResponse } from "@minecraft/server-ui";
const testForm1: SAPIProForm<ActionFormData> = {
    builder: (player, args) => {
        const form = new ActionFormData().title("测试").body("测试啊测试啊测试啊").button("已阅");
        return form;
    },
    handler: (res: ActionFormResponse, ctx) => {},
    beforeBuild: (ctx) => {},
};
```

#### builder:[FormBuiler](../docs/type-aliases/FormBuilder.md)

`FormBuilder:(player, args)=> Promise<T> | T`

builder 需要提供一个创建函数，每次都会使用它来创建表单。创建时会传入 player 和 args(上下文参数)返回值必须是 ActionFormData | ModalFormData | MessageFormData 的其中一个。

你可以为上下文参数设置属性如:`args.a=1`，这样你就可以在 handler 里拿到。

#### handler:[formHandler](../docs/type-aliases/formHandler.md)

`formHandler:(response: formResponseType<T>, context: SAPIProFormContext<T>) => void | Promise<void>`

**参数**：第一个参数是表单返回值，它和你的表单类型有关，例如:ActionFormData 将会返回 ActionFormResponse ; 第二个参数是上下文，你可以通过它进行导航，获得玩家等，具体后面介绍。

#### beforeBuild?[formBeforeBuild](../docs/type-aliases/formBeforeBuild.md)

`formBeforeBuild:(context: SAPIProFormContext<T>) => void | Promise<void>`

它将在表单已经入栈，builder 被执行前执行。此时你可以拿到 context，可以在其中执行自定义验证逻辑，并执行跳转，如果跳转，则 builder 不会被执行。不进行导航操作则会正常构建表单。

可以使用 formManager.open 来打开表单。

```typescript
formManager.open<T extends formDataType>(player: Player, form: SAPIProForm<T>, args?: contextArgs, delay = 0)
/*
player:玩家对象
formId:表单对象
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

表单上下文包含表单构建和处理中所需要的传入参数，玩家对象，导航操作等。它由 SAPI-Pro 自动管理，进行出栈与入栈。

#### 参数

`player:Player`
获取当前的玩家
`args:contextArgs`
自己设定的表单上下文参数，一般是上个表单传递的

#### 方法(此处只介绍几种)

`push(form: SAPIProForm<T>, args?: contextArgs, delay = 0)`
打开新表单，并加入堆栈

`pushNamed(name: string, args?: contextArgs, delay = 0)`
打开具名表单

`back(delay = 0)`
返回上一层

`reopen(delay = 0)`
重新打开当前表单（刷新）

`replace(form: SAPIProForm<T>, args?: contextArgs, delay = 0)`
替换当前表单

`offAll(form: SAPIProForm<T>, args?: contextArgs, delay = 0)`
清空堆栈，打开表单

---

### [常用表单 CommonForm](../docs/classes/CommonForm.md)

我们经常会用到一些相似结构的表单，常用表单可以轻松帮助你实现。它们返回常用表单类的实例，这些类都实现了SAPIProForm接口。

###

### CommonForm.ButtonForm 通用按钮表单

使用CommonForm类中的静态方法即可创建。

```ts
ButtonForm<U>(data: ButtonFormData<U>):ButtonForm<U>;
```

参考：[ButtonFormData](../docs/interfaces/ButtonFormData.md)

```ts
//此处已展开继承的接口
interface ButtonFormData<U extends contextArgs = contextArgs> {
    /**标题 */
    title?: TextType;
    /**自定义生成器 */
    generator?: formGenerator<T, U>;

    /**body */
    body?: TextType;
    /**按钮列表 */
    buttons?: FuncButton<U>[];
    /**按钮生成器 */
    buttonGenerator?: (player: Player, args: U, t: UniversalTranslator) => Iterable<FuncButton<U>>;
    /**列表处理 */
    handler?: (ctx: SAPIProFormContext<ActionFormData, U>, index: number) => Promise<void> | void;
    /**取消事件 */
    oncancel?: formHandler<ActionFormData, U>;
    /**表单验证器，验证失败则不打开表单 */
    validator?: formBeforeBuild<ActionFormData, U>;
}
```

title 和 body 是表单的标题和内容，是静态的，并支持字符串和翻译对象，如果要动态生成，可以使用generator(参见后文)。

#### buttons 静态按钮

buttons 看这个例子就懂了:

##### 示例

```typescript
const clockMenu: ButtonFormData = {
    title: clockMenuText.title, //"菜单"
    body: clockMenuText.body,
    buttons: [
        {
            icon: "ui/FriendsIcon",
            label: clockMenuText.tpa, //"玩家传送"
            func: (ctx) => {
                ctx.pushNamed("tpa.main");
            },
        },
        {
            icon: "blocks/jukebox_top",
            label: clockMenuText.musicPlayer, //"音乐播放器"
            func: (ctx) => {
                system.sendScriptEvent("music:open", ctx.player.id);
            },
        },
        {
            icon: "ui/recipe_book_icon.png",
            label: clockMenuText.statistics, //"统计信息"
            func: (ctx) => {
                ctx.push(statisticsForm);
            },
        },
        {
            icon: "gui/newgui/Language18.png",
            label: clockMenuText.langSetting, //"语言设置"
            func: (ctx) => {
                ctx.push(LangSettingForm);
            },
        },
    ],
};
```

通过以上例子，buttons的使用方法已经清晰。其中 icon 和 func 可以不写。
func 的参数是[SAPIProFormContext](#表单上下文-sapiproformcontext)

```typescript
func?: (context: SAPIProFormContext<ActionFormData>) => void | Promise<void>
```

#### buttonGenerator 动态生成按钮

那么这时候就有人说了，你这个不行，那万一我按钮要动态生成你不炸了吗？其实是有办法的，请看`buttonGenerator?: buttonGenerator`，语法如下:

```typescript
buttonGenerator: (player: Player, args: contextArgs): Record<string, FuncButton> | undefined;
```

通过 buttonGenerator，传入(player,args)，函数经过处理，返回要添加的按钮对象。还是直接用例子来看。

##### 示例

```typescript
const spMainForm = CommonForm.ButtonForm({
    title: "假人管理",
    body: "请选择选项",
    buttonGenerator: (player, args) => {
        if (isAdmin(player)) {
            return {
                假人结构配置: {
                    func: (ctx) => {
                        return ctx.push(spConfigForm);
                    },
                },
            };
        }
    },
    buttons: {
        创建假人: {
            func: (ctx) => {
                return ctx.push(spCreate);
            },
        },
        假人列表: {
            func: (ctx) => {
                return ctx.push(spList);
            },
        },
    },
    validator: (ctx) => {
        //略
    },
});
```

例子中使用 buttonGenerator 来根据玩家是否是管理员，动态添加了管理按钮，普通玩家只能看到下面两个按钮，而管理员可以看到配置按钮。

#### generator 自定义生成器

如果你对这些还不满意，还需要自己修改，那么你可以用 generator。

```typescript
generator:(form: T, player: Player, args: contextArgs): void | Promise<void>;
```

参考:[formGenerator](../docs/interfaces/formGenerator.md)

你可以用它来动态生成 body,title。添加按钮就不推荐了，毕竟可以直接用 buttonGenerator。

```typescript
//前面省略
generator: (form, player, ctx) => {
    form.body("xxx");
    form.title("xxx");
};
//后面省略
```

最后还有个 validator,就是[beforeBuild](#beforebuildformbeforebuild)。

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

```

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
