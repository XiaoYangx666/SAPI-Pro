**Documentation**

---

> 此文档纯手工编辑，未使用 AI

## 表单系统

表单系统可以自动的处理表单，包括表单上下文，返回上一层等等。这使用的是堆栈的数据结构，为每个玩家维护了一个表单堆栈。

### 注册基础表单

基础表单依然使用原版表单的创建方式，但是可以自动管理上下文，自动处理用户表单堆等。我们已经封装好了一些[常用表单](#模板表单)使得你可以更轻松的创建。

要注册一个基础表单，请通过`FormManager.register`，其中接受一个对象,必须是`FormData`。

##### 示例

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

通过`FormManager.register`可以注册一个 id 指定的表单，FormData 需要如下四个属性:

#### id:string

这是该表单的唯一 ID，不要和其它表单冲突，否则会覆盖。

#### builder:FormBuiler

`FormBuilder:(player, ctx)=>ActionFormData | ModalFormData | MessageFormData`

builder 需要提供一个创建函数，每次都会使用它来创建表单。创建时会传入 player 和 ctx(上下文)返回值必须是 ActionFormData | ModalFormData | MessageFormData 的其中一个。

你可以为上下文设置属性如:`ctx.a=1`，这样你就可以在 handler 里拿到。

#### handler:FormHandler

`FormHandler:(player: Player, response: ActionFormResponse | ModalFormResponse | MessageFormResponse, context: context):  NavigationCommand | undefined | void`

**参数**：第二个参数是表单返回值，你需要指定一个，必须和 builder 中的相符合。第三个参数是上下文，你可以拿到上个表单传入的上下文或是 handler 设置的上下文。
**返回值**：如果直接关掉就不用传返回值。如果想要操作表单，如上一级，打开新表单，重新打开表单等，你需要传入[NavigationCommand](#navigationcommand-表单导航操作)。

#### validator?FormValidator

`FormValidator:(player: Player, context: context)=>boolean | NavigationCommand`

这是一个验证函数，可以没有。传入 player 和 context，你可以根据玩家或上下文判断是否应该为玩家打开表单。返回 true(正常打开)，false(直接关闭表单)或[NavigationCommand](#navigationcommand-表单导航操作)，来自己控制。

注册完成后，可以使用 FormManager.open 来打开表单。

```typescript
FormManager.open(player: Player, formId: string, initialData?: any, delay = 0)
/*
player:玩家对象
formId:表单id
initialData:表单上下文
delay:打开延迟(单位tick)
*/
```

以下是[简单假人]()UI 中的部分代码，使用了基础表单来创建。

##### 实际示例

```typescript
FormManager.register({
    id: "sp.new",
    //async可以不加
    builder: async (player, context) => {
        const form = new ModalFormData().title("创建假人").textField("假人名字", "输入假人名字，不能有特殊字符");
        return form;
    },
    handler: (player, res: ModalFormResponse, context) => {
        if (res.formValues == undefined) return undefined; //没值直接关闭
        const name = res.formValues[0] as string;
        const validation = spNameValidator(name, player);
        if (validation == true) {
            system.run(() => {
                spManager.Spawn(name, player.location, { dimension: player.dimension, rotation: player.getRotation() });
            });
        } else {
            spManager.mes(player, validation);
            return { type: NavType.REOPEN }; //名字有特殊字符重新打开
        }
        return undefined; //仍让关闭
    },
});
```

---

### 模板表单

模板表单是一种内置好的表单，因为这类表单有着相似的结构和处理，所以把它作为模板。接下来我们介绍三种模板表单。

### CommonForm.ButtonForm 通用按钮表单

语法是`CommonForm.ButtonForm(data:ButtonFormData)`，使用这个后就不需要再在 `FormManager` 里注册了，自动帮你注册。其中 ButtonFormData 的结构如下:

```typescript
interface ButtonFormData {
    title?: string;
    body?: string;
    buttons?: Record<string, FuncButton>; //按钮对象
    buttonGenerator?: buttonGenerator; ///按钮生成器
    oncancel?: FormHandler; ///取消事件
    /**自定义生成器，如果只需要按钮可以用按钮生成器 */
    generator?: formGenerator<ActionFormData>; //通用生成器
    validator?: FormValidator; ///表单验证器
}
```

title 和 body 就不讲了，就是标题和内容，你可以选填。

#### buttons 静态按钮

而 buttons 就是很方便的了，也不讲参数了，看这个例子就懂了:

##### 示例

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
        领地: {
            icon: "blocks/grass_side_carried",
            func: () => {
                return { type: NavType.OPEN_NEW, formId: "res.main" };
            },
        },
        假人配置: {
            icon: "ui/dressing_room_skins",
            func: (p) => {
                return { type: NavType.OPEN_NEW, formId: "sp.main" };
            },
        },
        //...更多省略...
    },
};
```

懂的都懂好吧，buttons 怎么用应该很明显了吧。其中 icon 可以不写。
而其中的 func 也可以接受 context，只不过上面钟表菜单都不需要 context，就没写。具体语法如下:

```typescript
func: (player: Player, context: context) => Promise<NavigationCommand | undefined> | NavigationCommand | undefined;
```

#### buttonGenerator 动态生成按钮

那么这时候就有人说了，你这个不行，那万一我按钮要动态生成你不炸了吗？其实是有办法的，请看`buttonGenerator?: buttonGenerator`，语法如下:

```typescript
buttonGenerator: (player: Player, context: context) => Record<string, FuncButton> | undefined;
```

通过 buttonGenerator，传入(player,context)，函数经过处理，返回要添加的按钮对象。还是直接用例子来看。

##### 示例

```typescript
CommonForm.ButtonForm("sp.init", {
    title: "假人管理",
    body: "假人未初始化，请点击初始化",
    buttonGenerator: (player, ctx) => {
        if (isAdmin(player)) {
            return {
                假人结构配置: {
                    func: (player) => {
                        return { type: NavType.OPEN_NEW, formId: "sp.Config" };
                    },
                },
            };
        }
    },
    buttons: {
        初始化: {
            func: async (player) => {
                const ans = await spManager.initStructure();
                if (ans) return { type: NavType.RESET_OPEN, formId: "sp.main" };
                spManager.mes(player, "假人初始化失败!");
                return;
            },
        },
    },
});
```

例子中使用 buttonGenerator 来根据玩家是否是管理员，动态添加了管理按钮，普通玩家只能看到初始化，而管理员可以进行配置。

#### generator 自定义生成器

如果你对这些还不满意，还需要自己修改，那么你可以用 generator。

```typescript
generator:(form: ActionFormData, player: Player, context: context)=> void;
```

你可以用它来动态生成 body,title。添加按钮就不推荐了，毕竟可以直接用 buttonGenerator。

```typescript
//前面省略
generator: (form, player, ctx) => {
    form.body("xxx");
    form.title("xxx");
};
//后面省略
```

最后还有个 validator,不用讲了吧，和前面一样的([FormValidator](#validatorformvalidator))

### CommonForm.ButtonListForm 按钮列表表单

按钮列表表单适用于一堆按钮，最后根据玩家选择的序号来执行相应的操作的场景。当然，你也可以用前面的`ButtonForm`来实现，只需要用`buttonGenerator`就行了。

仍然先上语法
`CommonForm.ButtonListForm(id: string, data: ButtonListFormData)`

```typescript
interface ButtonListFormData {
    title?: string; //标题
    body?: string; //body
    generator?: formGenerator<ActionFormData>; //通用生成器
    handler: ListFormHandler; //处理函数
    oncancel?: FormHandler; //取消事件
    validator?: FormValidator; //表单验证器
}
```

#### generator

在这里，我们使用 generator 来生成列表，generator 和上面 ButtonForm 的是一样的。

##### 示例

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

上面这个例子使用 generator 来生成假人列表，并且将假人列表设置到 context 中，这样 handler 就可以拿到 generator 里假人列表，进而方便处理。

#### handler:ListFormHandler

```typescript
handler: (player: Player, selection: number, context: context) => Promise<NavigationCommand | undefined> | NavigationCommand | undefined;
```

看了上面的例子，其实这个也很简单。  
这个函数会传入一个 selection，selection 就是玩家选择的按钮序号，从 0 开始。而 context 是上下文。可以根据玩家选择项的不同进行不同的逻辑。

### CommonForm.BodyInfoForm

这个会创建一个只有标题，body 和一个确认按钮的表单。3,2,1,上语法

```typescript
CommonForm.BodyInfoForm(id: string, title: string, body: formGenerator<ActionFormData> | string)
```

可以看到，只需要传入 id,title,body。其中 body 可以传 string 或 formGenerator。如果你是静态的表单。那么直接传字符串就行了，如果内容动态生成，那么传 formGenerator 就对了。

##### 示例

```typescript
CommonForm.BodyInfoForm("aichat.prompt", "AIChat系统提示词", (form, player, context) => {
    form.body(Prompts[Config.systemPrompt]);
});
```

这个太简单了好吧，不多说了。

### CommonForm.SimpleMessageForm

这个可以创建一个简单的对话框，用户只需要选择是或不是。

`CommonForm.SimpleMessageForm(id: string, data: SimpleMessageFormData)`

其中 data:SimpleMessageFormData 是这个:

```typescript
interface SimpleMessageFormData {
    title?: string;
    body?: string;
    generator?: (form: MessageFormData, player: Player, context: context) => void; //通用生成器
    button1?: string; //按钮1
    button2?: string; //按钮2
    handler: FormHandler; //处理函数
}
```

button1，button2 就是对话框的俩按钮，你静态的话就直接写上。如果动态的话你也可以用 generator 来生成，自由度很高。  
handler 就是处理函数([FormHandler](#handlerformhandler))，你自己根据结果处理就行。没有 oncancel，但是 handler 也可以处理，问题不大。

##### 示例

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

---

### NavigationCommand 表单导航操作

相信你已经在前面的示例看到了很多 NavType 了。其实这个就是用来控制表单的。

你可以通过[FormHandler](#handlerformhandler)的返回值，或者 CommonForm 中 handler 的返回值，或者 ButtonForm 中按钮函数的返回值来控制表单自由变换。

NavigationCommand 是一个接口

```typescript
interface NavigationCommand {
    /** 导航操作类型*/
    type: NavType;
    /**表单id */
    formId?: string;
    /**上下文 */
    contextData?: any;
}
```

首先 NavType 是必填的，可以是下面这些。

```typescript
enum NavType {
    OPEN_NEW, //打开新页面
    BACK, //返回上一页
    REOPEN, //刷新当前页面
    CLOSE, // 关闭所有
    RESET_OPEN, //重置并打开新页面
    REPLACE, //替换当前页面
}
```

要进行什么操作你自己定。但是需要注意的是，如果填`NavType.OPEN_NEW`那就需要同时填写`formId`，否则不知道要打开哪个页面。其它一些操作也同理

以下是一些详细介绍

-   NavType.BACK:返回上一层，没有就关掉了
-   NavTypSe.OPEN_NEW:打开新页面，需填写 formId，选填上下文。
-   NavType.REOPEN:重新打开当前页面
-   NavType.CLOSE:关闭所有页面，相当于不返回
-   NavType.RESET_OPEN:重置历史记录并打开新页面，需提供 formId
-   NavType.REPLACE:替换当前页面，需提供 formId

##### 示例

```typescript
//注册表单
FormManager.register({
    id: "test",
    builder: (player, ctx) => {
        const form = new ModalFormData().title("测试表单").textField("1+1=?", "114514");
        ctx.ans = 2;
        return form;
    },
    handler: (player, res: ModalFormResponse, ctx) => {
        if (res.formValues) {
            if (parseInt(res.formValues[0] as string) == ctx.ans) {
                player.sendMessage("666答对了");
                return;
            }
        }
        player.sendMessage("菜，就多练");
        return { type: NavType.REOPEN };
    },
});
//注册打开表单的命令
pcommand.registerCommand(
    new Command("formtest", "表单测试", false, (player) => {
        FormManager.open(player, "test", {}, 10);
    })
);
```

以上是来自 [README.md](../README.md#-表单管理) 的一个示例，可以看到，在 handler 中使用了`return { type: NavType.REOPEN }`来重新打开表单。

其它例子你可以去上面看，几乎都用到了。

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

使用原版方法，管理这多层信息，并处理层级返回、跳转等可能变得略显复杂。使用 FormManager 表单上下文可以很方便的管理这些参数。

1.在打开第一层表单时，玩家的上下文栈被清空，并设置为初始上下文(空)。

```typescript
//打开第一层
FormManager.open(player, "res.list", {}, 10);
```

第一层选择了领地后，打开第二层

```typescript
//第一层->第二层
handler: (player, selection, context) => {
        if (selection == 0) {
            return { type: NavType.BACK };
        }
        return {
            type: NavType.OPEN_NEW, formId: "res.info",
            contextData: { item: context.resList[selection - 1] }
        };
    },
```

此处将新页面的上下文设为了选中的领地，然后打开了新的页面`res.info`。第二层打开第三层时 contextData 没有变化，因此直接复制。

```typescript
//第二层->第三层
return {
    type: NavType.OPEN_NEW,
    formId: "res.friend.list",
    contextData: { item: context.item },
};
```

接下来是第四层，玩家选择了要删除的好友。

```typescript
//第三层->第四层
return {
    type: NavType.OPEN_NEW,
    formId: "res.friend.remove.confirm",
    contextData: {
        item: context.item,
        fname: resgame.playerRes.getPlayerName(context.item.fid[selection - 1]),
    },
};
```

不用管后面比较多的获取函数，可以看到 contextData 仍然复制了 item，并新增了 fname 传到下一层表单。

至此，该玩家上下文栈为:

```typescript
[
    {name:"res.list",data:{ resList: xxx }},
    {name:"res.info",data:{ item: xxx }},
    {name:"res.friend.list",data:{ item: xxx }},
    {name:"res.friend.remove.confirm",{ item: xxx, fname: xxx }}
]
```

每一层表单都获取到了所需要的数据(第一层中 resList 是在 builder 中设置的，用于传递给 handler)

此时如果要返回，那么就可以直接弹出第四层的，我们仍然可以拿到第三层的表单 id 和 item，第三层仍然可以正常显示。第二层也同样。
