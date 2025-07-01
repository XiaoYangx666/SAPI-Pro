**Documentation**

---

> 此文档纯手工编辑，未使用 AI

## 表单系统

### 目录

-   [SAPI-Pro 表单](#sapi-pro-表单)
    -   [示例](#实际示例)
    -   [注册具名表单](#注册具名表单)
-   [表单上下文](#表单上下文-sapiproformcontext)
-   [模板表单](#模板表单)
    -   [ButtonForm](#commonformbuttonform-通用按钮表单)
    -   [ButtonListForm](#commonformbuttonlistform-按钮列表表单)
    -   [BodyInfoForm](#commonformbodyinfoform)
    -   [SimpleMessageForm](#commonformsimplemessageform)
-   [多层表单处理](#使用上下文处理多层表单)

### SAPI-Pro 表单

SAPI-Pro 表单使用类型[SAPIProForm](../docs/interfaces/SAPIProForm.md)构建，指定表单类型，即可构建表单。

##### 示例

```typescript
import { ActionFormData } from "@minecraft/server-ui";
import { FormManager } from "SAPI-Pro/Form/main";
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

#### builder:FormBuiler

`FormBuilder:(player, args)=> Promise<T> | T`

builder 需要提供一个创建函数，每次都会使用它来创建表单。创建时会传入 player 和 args(上下文参数)返回值必须是 ActionFormData | ModalFormData | MessageFormData 的其中一个。

你可以为上下文参数设置属性如:`args.a=1`，这样你就可以在 handler 里拿到。

#### handler:formHandler

`formHandler:(response: formResponseType<T>, context: SAPIProFormContext<T>) => void | Promise<void>`

**参数**：第一个参数是表单返回值，它和你的表单类型有关，例如:ActionFormData 将会返回 ActionFormResponse ; 第二个参数是上下文，你可以通过它进行导航，获得玩家等，具体后面介绍。

#### beforeBuild?formBeforeBuild

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
        const form = new ModalFormData().title("创建假人").textField("假人名字", "输入假人名字，不能有特殊字符");
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

使用一下代码来注具名表单：
`formManager.registerNamed(name: string, form: SAPIProForm<T>)`

---

### 表单上下文 SAPIProFormContext

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

### 模板表单

模板表单是一种内置好的表单，因为这类表单有着相似的结构和处理，所以把它作为模板。接下来我们介绍三种模板表单。

### CommonForm.ButtonForm 通用按钮表单

语法是`CommonForm.ButtonForm(data:ButtonFormData)`，返回`SAPIProForm<ActionFormData>`。

参考：[ButtonFormData](../docs/interfaces/ButtonFormData.md)

title 和 body 就不讲了，就是标题和内容，你可以选填。

#### buttons 静态按钮

buttons 看这个例子就懂了:

##### 示例

```typescript
const clockMenu: ButtonFormData = {
    title: "菜单",
    body: "请选择你要打开的功能",
    buttons: {
        自动整理: {
            icon: "blocks/chest_front",
            func: (ctx) => {
                formManager.openExternal(ctx.player, "sorter", "sorter.main");
            },
        },
        玩家互传: {
            icon: "ui/FriendsIcon",
            func: (ctx) => {
                ctx.pushNamed("tpa.main");
            },
        },
        音乐播放器: {
            icon: "blocks/jukebox_top",
            func: (ctx) => {
                system.sendScriptEvent("music:open", ctx.player.id);
            },
        },
        领地: {
            icon: "blocks/grass_side_carried",
            func: (ctx) => {
                ctx.pushNamed("res.main");
            },
        },
    },
};
```

懂的都懂好吧，buttons 怎么用应该很明显了吧。其中 icon 可以不写。
func 的参数是[SAPIProFormContext](#表单上下文-sapiproformcontext)

```typescript
func: (context: SAPIProFormContext<ActionFormData>) => void | Promise<void>
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

### CommonForm.ButtonListForm 按钮列表表单

按钮列表表单适用于一堆按钮，最后根据玩家选择的序号来执行相应的操作的场景。当然，你也可以用前面的`ButtonForm`来实现，只需要用`buttonGenerator`就行了。

仍然先上语法
`CommonForm.ButtonListForm(data: ButtonListFormData)`

参考:[ButtonListFormData](../docs/interfaces/ButtonListFormData.md)

#### generator

在这里，我们使用 generator 来生成列表，generator 和上面 ButtonForm 的是一样的。

##### 示例

```typescript
const spList = CommonForm.ButtonListForm({
    title: "假人列表",
    generator: (form, player, args) => {
        const spList = spManager.getSPList();
        form.button("返回");
        for (let spdata of spList) {
            form.button(spdata.sp.name);
        }
        args.list = spList;
    },
    handler: (selection, ctx) => {
        if (selection == 0) return ctx.back();
        ctx.push(spInfo, { spdata: ctx.args.list[selection - 1] });
    },
    validator: (ctx) => {
        if (spManager.getSPList().length == 0) {
            spManager.mes(ctx.player, "没有假人，请先创建");
            ctx.back();
        }
    },
});
```

上面这个例子使用 generator 来生成假人列表，并且将假人列表设置到 context 的 args 中，这样 handler 就可以拿到 generator 里假人列表，进而方便处理。

#### handler:ListFormHandler

```typescript
handler: (selection: number, context: SAPIProFormContext<ActionFormData>) =>
    Promise<void > | void;
```

看了上面的例子，其实这个也很简单。  
这个函数会传入一个 selection，selection 就是玩家选择的按钮序号，从 0 开始。而 context 是上下文。可以根据玩家选择项的不同进行不同的逻辑。

### CommonForm.BodyInfoForm

这个会创建一个只有标题，body 和一个确认按钮的表单。3,2,1,上语法

```typescript
CommonForm.BodyInfoForm(title: string, body: formGenerator<ActionFormData> | string)
```

可以看到，只需要传入 title,body。其中 body 可以传 string 或 formGenerator。如果你是静态的表单。那么直接传字符串就行了，如果内容动态生成，那么传 formGenerator 就对了。

##### 示例

```typescript
const promptPage = CommonForm.BodyInfoForm("AIChat系统提示词", (form, player, args) => {
    form.body(Prompts[Config.systemPrompt]);
});
```

这个太简单了好吧，不多说了。

### CommonForm.SimpleMessageForm

这个可以创建一个简单的对话框，用户只需要选择是或不是。

`CommonForm.SimpleMessageForm(data: SimpleMessageFormData)`

其中 data:SimpleMessageFormData 是这个:

参考:[SimpleMessageFormData](../docs/interfaces/SimpleMessageFormData.md)

button1，button2 就是对话框的俩按钮，你静态的话就直接写上。如果动态的话你也可以用 generator 来生成，自由度很高。  
handler 就是处理函数([formHandler](#handlerformhandler))，你自己根据结果处理就行。没有 oncancel，但是 handler 也可以处理，问题不大。

##### 示例

```typescript
const deleteFriendConfirmForm = CommonForm.SimpleMessageForm({
    title: "删除好友",
    button1: "取消",
    button2: "确定",
    generator: (form, p, args) => {
        form.body(`你确定要删除领地§3${args.item.rname}§r的好友:§e${args.fname}§r吗？`);
    },
    handler: (res: MessageFormResponse, context) => {
        if (res.selection == undefined) return undefined;
        if (res.selection == 1) {
            resgame.removeFriend(context.args.item.id, context.player, context.args.fname);
        }
        context.back();
    },
});
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
