[**Documentation**](../../../README.md)

---

[Documentation](../../../globals.md) / [Event](../README.md) / itemBus

# Variable: itemBus

> `const` **itemBus**: [`itemBase`](../classes/itemBase.md)

##### 示例

```typescript
//钟表菜单
itemBus.bind("minecraft:clock", (player: Player) => {
    FormManager.open(player, "menu.main");
});
```
