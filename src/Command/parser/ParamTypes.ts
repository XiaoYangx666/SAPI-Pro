import { CustomCommandParamType } from "@minecraft/server";

export enum paramTypes {
    flag,
    boolean,
    enum,
    int,
    float,
    target,
    position,
    string,
    itemType,
    blockType,
    /**仅支持原生命令使用 */
    player,
    /**仅支持原生命令使用 */
    entity,
    entityType,
}

/** 类型映射*/
export const NativeTypeMapping: Record<keyof typeof paramTypes, CustomCommandParamType> = {
    flag: CustomCommandParamType.Enum,
    boolean: CustomCommandParamType.Boolean,
    enum: CustomCommandParamType.Enum,
    int: CustomCommandParamType.Integer,
    float: CustomCommandParamType.Float,
    target: CustomCommandParamType.PlayerSelector,
    player: CustomCommandParamType.PlayerSelector,
    position: CustomCommandParamType.Location,
    string: CustomCommandParamType.String,
    itemType: CustomCommandParamType.ItemType,
    blockType: CustomCommandParamType.BlockType,
    entity: CustomCommandParamType.EntitySelector,
    entityType: CustomCommandParamType.EntityType,
};
