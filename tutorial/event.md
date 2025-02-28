**Documentation**

---

## 事件订阅

首先引入

```typescript
import { Event } from "SAPI-Pro/main";
```

### Event.chatBus

##### 函数

`subscribe(callback: (t: ChatSendBeforeEvent) => void | chatOpe, priority: number = 0)`
订阅聊天事件，约等于 world.beforeEvents.chatSend.subscribe

##### 示例

```typescript
Event.chatBus.subscribe((t) => {
    world.sendMessage(t.sender.name + t.message);
});
```

### Event.intervalBus

##### 函数

`subscribetick(callback: () => void)`
订阅 tick，每 tick 执行一次回调

`subscribesec(callback: (lastsec: number) => void)`
订阅秒，每秒执行一次回调

`subscribemin(callback: () => void)`
订阅分钟，每分钟执行一次回调

##### 示例

```typescript
//简单的tps计算器
Event.intervalBus.subscribesec((lastsec) => {
    tps = ((system.currentTick - lasttick) / ((Date.now() - lastsec) / 1000)).toFixed(1);
    if (parseFloat(tps) > 20) tps = "20.0";
    lasttick = system.currentTick;
    cmd("scoreboard players reset * gg");
    cmd(`scoreboard players set "§6tps §r${tps}" gg 3`);
});
```

### Event.itemBus

##### 函数

`bind(itemid: string, func: (player: Player) => void)`
为物品使用绑定一个函数

##### 示例

```typescript
Event.itemBus.bind("minecraft:clock", (player: Player) => {
    FormManager.open(player, "menu.main");
});
```

### Event.ScriptEventBus

##### 函数

`bind(id: string, func: (t: ScriptEventCommandMessageAfterEvent) => void)`
绑定一个 scriptEvent

> 发送 scriptEvent 可以使用 SAPI 原版命令:
> `system.scriptEvent(id: string, message: string): void;`
