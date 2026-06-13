## 事件订阅

导入

```typescript
import { intervalBus, chatBus, itemBus, ScriptEventBus } from "sapi-pro/Event";
```

### chatBus(仅限sapi-pro beta版)

##### 函数

`subscribe(callback: (t: ChatSendBeforeEvent) => void | chatOpe, priority: number = 0)`
订阅聊天事件，priority越大越先处理。
返回空则继续发送并由其它函数处理，要拦截则返回`chatOpe.cancel·

`regsend(callback: (t: ChatSendBeforeEvent) => boolean)`注册聊天处理函数，聊天处理函数在所有其它处理函数执行完后执行，仅能注册一个

##### 示例

```typescript
Event.chatBus.subscribe((t) => {
    world.sendMessage(t.sender.name + t.message);
});
```

### intervalBus

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
export const gg = new ScoreBoardDataBase("gg", "公告");
Event.intervalBus.subscribesec((lastsec) => {
    tps = ((system.currentTick - lasttick) / ((Date.now() - lastsec) / 1000)).toFixed(1);
    if (parseFloat(tps) > 20) tps = "20.0";
    lasttick = system.currentTick;
    //设置计分板
    gg.clear();
    gg.set(`§6TPS §r${tps}`, 3);
});
```

### itemBus

##### 函数

`bind(itemid: string, func: (player: Player) => void)`
为物品使用绑定一个函数

##### 示例

```typescript
Event.itemBus.bind("minecraft:clock", (player: Player) => {
    formManager.openNamed(player, "menu.main");
});
```

### ScriptEventBus

##### 函数

`bind(id: string, func: (t: ScriptEventCommandMessageAfterEvent) => void)`
绑定一个 scriptEvent

> 发送 scriptEvent 可以使用 SAPI 原版命令:
> `system.scriptEvent(id: string, message: string): void;`
