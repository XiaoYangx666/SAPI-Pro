[**sapi-pro**](../../../../README.md)

***

[sapi-pro](../../../../globals.md) / [Utils](../README.md) / ChunkUtils

# Class: ChunkUtils

有关区块的工具

## Constructors

### Constructor

> **new ChunkUtils**(): `ChunkUtils`

#### Returns

`ChunkUtils`

## Methods

### getChunkEntities()

> `static` **getChunkEntities**(`dimensionId`, `pos`): `Entity`[]

获取指定位置的区块中，全部的实体和玩家的ID列表

#### Parameters

##### dimensionId

[`DimensionIds`](../enumerations/DimensionIds.md)

维度Id

##### pos

`Vector3`

指定位置的坐标

#### Returns

`Entity`[]

实体和玩家的ID的列表，当指定位置的区块不存在或尚未加载时，返回空数组

***

### getChunkMaxPos()

> `static` **getChunkMaxPos**(`chunkPos`): `Vector3`

获取某区块最大点的坐标

#### Parameters

##### chunkPos

`VectorXZ`

指定区块的坐标

#### Returns

`Vector3`

该区块最大点的坐标

***

### getChunkMinPos()

> `static` **getChunkMinPos**(`chunkPos`): `Vector3`

获取某区块最小点的坐标

#### Parameters

##### chunkPos

`VectorXZ`

指定区块的坐标

#### Returns

`Vector3`

该区块最小点的坐标

***

### getChunkPosFromBlockPos()

> `static` **getChunkPosFromBlockPos**(`pos`): `VectorXZ`

通过方块坐标获得该方块所在区块坐标

#### Parameters

##### pos

`Vector3`

方块的坐标

#### Returns

`VectorXZ`

该方块所在区块的坐标
