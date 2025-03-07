[**Documentation**](../README.md)

---

[Documentation](../globals.md) / pcommand

# Variable: pcommand

> `const` **pcommand**: [`commandParser`](../classes/commandParser.md)

commandParser 的实例，用于注册命令

#### 函数

[registerCommand](../classes/commandParser.md#registercommand)

#### 示例

```typescript
import { pcommand, Command } from "SAPI-Pro/Command/main";
const exampleCmd = new Command("test", "命令测试", false, (player, param) => {
    player.sendMessage("你输入的是" + param.Name);
}); //创建命令对象
exampleCmd.addParam({
    name: "Name",
    type: "string",
}); //添加单个参数
pcommand.registerCommand(exampleCmd); //注册命令
```
