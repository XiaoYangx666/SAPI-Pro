[**Documentation**](../../../README.md)

---

[Documentation](../../../globals.md) / [Event](../README.md) / intervalBus

# Variable: intervalBus

> `const` **intervalBus**: [`intervalBusClass`](../classes/intervalBusClass.md)

##### 示例

```typescript
//简单tps计算
let lasttick = system.currentTick;
let tps = "20.0";
intervalBus.subscribesec((lastsec) => {
    tps = ((system.currentTick - lasttick) / ((Date.now() - lastsec) / 1000)).toFixed(1);
    if (parseFloat(tps) > 20) tps = "20.0";
    lasttick = system.currentTick;
    cmd("scoreboard players reset * gg");
    cmd(`scoreboard players set "§6tps §r${tps}" gg 3`);
});
```
