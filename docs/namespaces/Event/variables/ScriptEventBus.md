[**Documentation**](../../../README.md)

---

[Documentation](../../../globals.md) / [Event](../README.md) / ScriptEventBus

# Variable: ScriptEventBus

> `const` **ScriptEventBus**: [`ScriptEventBusClass`](../classes/ScriptEventBusClass.md)

##### 示例

```typescript
//多行为包表单互通
ScriptEventBus.bind("form:open", (t) => {
    try {
        const data = JSON.parse(t.message) as openFormData;
        const player = getPlayerById(data.playerid);
        if (player) {
            FormManager.open(player, data.id, data.initialData, data.delay, false);
        }
    } catch (e) {}
});
```
