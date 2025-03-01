[**Documentation**](../../../README.md)

---

[Documentation](../../../globals.md) / [Event](../README.md) / chatBus

# Variable: chatBus

> `const` **chatBus**: [`chatBusClass`](../classes/chatBusClass.md)

##### 示例

```typescript
//捕获#开头的消息
chatBus.subscribe((t) => {
    let cancel = false;
    if (t.message[0] == "#") {
        system.run(() => {
            //进行一些操作
        });
    }
    if (cancel) return chatOpe.cancel;
});
```
