## Utils

常用工具

- chunkUtils: 区块计算相关，包括求区块范围，最大最小点
- logger: 日志相关
- RandomUtils: 随机相关，包括随机数，范围随机，随机选择，shuffle
- Vector3Utils: 坐标计算，包括加减，scale，dot，及坐标转换数组，字符串等

导入:

```ts
import { xxx } from "sapi-pro/utils";
```

## Deferred

用于延迟初始化变量，可用于处理early-excution问题。

- worldDeferredObject：创建在世界加载后才初始化的对象
- createDeferredValue: 创建在调用时加载的对象

导入:

```ts
import { createDeferredValue, worldDeferredObject } from "sapi-pro/Deferred";
```

## func

- isAdmin:
  **重要**:判断是否管理员，通过自身权限是否等于`PlayerPermissionLevel.Operator`来判断
- getAllPlayers:
  安全获取所有玩家(排除undefined，避免获取到不支持的假人)
- getPlayerById: 根据实体 id 获取玩家
- getPlayerByName: 根据玩家名获取玩家
- generateUUID: 生成 UUID

导入:

```ts
import { xxx } from "sapi-pro/func";
```

## constants

### Dimensions

维度常量，包含`Dimensions.Overworld`,`Dimensions.Nether`及`Dimensions.End`。
获取维度优先使用这个而非`world.getDimension`

```ts
import { Dimensions } from "sapi-pro/constants";
```
