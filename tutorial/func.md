**Documentation**

---

## 实用函数

```typescript
import { Func } from "SAPI-Pro/main"; //从main导入
import { xxx } from "SAPI-Pro/func"; //或直接从func导入
```

#### 玩家相关

-   [isAdmin](../docs/namespaces/Func/functions/isAdmin.md)
    **重要**:判断是否管理员，默认通过是否有 tag:op 来判断，你可以自己改逻辑
-   [getAllPlayers](../docs/namespaces/Func/functions/getAllPlayers.md)
    获取所有玩家，(命令系统通过这个获取玩家)这个可以自定义，例如你想排除哪些玩家，可以自己改
-   [getPlayerById](../docs/namespaces/Func/functions/getPlayerById.md) 根据实体 id 获取玩家
-   [getPlayerByName](../docs/namespaces/Func/functions/getPlayerByName.md) 根据玩家名获取玩家

#### 坐标相关

-   [ArraytoVector3](../docs/namespaces/Func/functions/ArraytoVector3.md) 数组转 Vector3
-   [Vector3toArray](../docs/namespaces/Func/functions/Vector3toArray.md) Vector3 转数组
-   [Vector3Add](../docs/namespaces/Func/functions/Vector3Add.md) 两个 Vector3 相加
-   [intloc](../docs/namespaces/Func/functions/intloc.md) 把 Vector3 转为整数
-   [tointloc](../docs/namespaces/Func/functions/tointloc.md) 把 Vector3 转为整数数组
-   [calChunk](../docs/namespaces/Func/functions/calChunk.md) 根据坐标计算所在区块
-   [distance](functions/distance.md) 计算距离(不开平方)
-   [distance_sqrt](../docs/namespaces/Func/functions/distance_sqrt.md) 计算距离(开平方)

#### 其它

-   [cmd](../docs/namespaces/Func/functions/cmd.md) 在主世界运行命令
-   [generateUUID](../docs/namespaces/Func/functions/generateUUID.md) 生成 UUID(网上找的)
-   [getScoreboardObj](../docs/namespaces/Func/functions/getScoreboardObj.md) 获取计分板，没有就创建
-   [rand](../docs/namespaces/Func/functions/rand.md) 生成范围随机数

欢迎各位贡献更多实用函数或为函数归类
