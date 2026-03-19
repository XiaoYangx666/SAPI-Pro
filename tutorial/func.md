**Documentation**

---

## 实用函数

```typescript
import { Func } from "sapi-pro"; //从main导入
import { xxx } from "sapi-pro/func"; //或直接从func导入
```

#### 玩家相关

- [isAdmin](../docs/sapi-pro/namespaces/Func/functions/isAdmin.md)
  **重要**:判断是否管理员，通过自身权限是否等于`PlayerPermissionLevel.Operator`来判断
- [getAllPlayers](../docs/sapi-pro/namespaces/Func/functions/getAllPlayers.md)
  安全获取所有玩家(排除undefined，避免获取到不支持的假人)
- [getPlayerById](../docs/sapi-pro/namespaces/Func/functions/getPlayerById.md) 根据实体 id 获取玩家
- [getPlayerByName](../docs/sapi-pro/namespaces/Func/functions/getPlayerByName.md) 根据玩家名获取玩家

#### 坐标相关

从sapi-pro 0.4开始，坐标运算已集成到[Vector3Utils](../docs/classes/Vector3Utils.md)

#### 其它

- [cmd](../docs/sapi-pro/namespaces/Func/functions/cmd.md) 在主世界运行命令
- [generateUUID](../docs/sapi-pro/namespaces/Func/functions/generateUUID.md) 生成 UUID(网上找的)

欢迎各位贡献更多实用函数或为函数归类
