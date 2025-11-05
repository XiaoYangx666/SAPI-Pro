import { Entity, Vector3, VectorXZ, world } from "@minecraft/server";
import { DimensionIds } from "./vanila-data";

/**有关区块的工具 */
export class ChunkUtils {
    /**
     * 通过方块坐标获得该方块所在区块坐标
     * @param pos 方块的坐标
     * @returns 该方块所在区块的坐标
     */
    static getChunkPosFromBlockPos(pos: Vector3): VectorXZ {
        return {
            x: pos.x >> 4,
            z: pos.z >> 4,
        };
    }

    /**
     * 获取指定位置的区块中，全部的实体和玩家的ID列表
     * @param dimensionId 维度Id
     * @param pos 指定位置的坐标
     * @returns 实体和玩家的ID的列表，当指定位置的区块不存在或尚未加载时，返回空数组
     **/
    static getChunkEntities(dimensionId: DimensionIds, pos: Vector3): Entity[] {
        const chunkPos = this.getChunkPosFromBlockPos(pos);
        const min = this.getChunkMinPos(chunkPos);
        const dim = world.getDimension(dimensionId);
        if (!dim.isChunkLoaded(pos)) return [];
        return dim.getEntities({
            location: min,
            volume: {
                x: 16,
                y: 384,
                z: 16,
            },
        });
    }

    /**
     * 获取某区块最大点的坐标
     * @param chunkPos 指定区块的坐标
     * @returns 该区块最大点的坐标
     */
    static getChunkMaxPos(chunkPos: VectorXZ): Vector3 {
        return {
            x: chunkPos.x * 16 + 15,
            y: 319,
            z: chunkPos.z * 16 + 15,
        };
    }

    /** 获取某区块最小点的坐标
     * @param chunkPos 指定区块的坐标
     * @returns 该区块最小点的坐标
     */
    static getChunkMinPos(chunkPos: VectorXZ): Vector3 {
        return {
            x: chunkPos.x * 16,
            y: -64,
            z: chunkPos.z * 16,
        };
    }
}
