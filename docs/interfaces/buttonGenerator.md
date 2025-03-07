[**Documentation**](../README.md)

---

[Documentation](../globals.md) / buttonGenerator

# Interface: buttonGenerator()

> **buttonGenerator**(`player`, `context`): `undefined` \| `Record`\<`string`, [`FuncButton`](FuncButton.md)\>

按钮生成器，用于自定义按钮

## Parameters

### player

`Player`

### context

[context](context.md)

## Returns

`undefined` \| `Record`\<`string`, [FuncButton](FuncButton.md)\>

## 示例

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
