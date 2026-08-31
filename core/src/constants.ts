import { Dimension, world } from "@minecraft/server";
import { worldDeferredObject } from "./Deferred/createDeferredObject";
import { DimensionIds } from "./utils/vanila-data";

//维度常量
type Dimensions = {
    [K in keyof typeof DimensionIds]: Dimension;
};
export const Dimensions = worldDeferredObject<Dimensions>(() => {
    return {
        Overworld: world.getDimension(DimensionIds.Overworld),
        Nether: world.getDimension(DimensionIds.Nether),
        End: world.getDimension(DimensionIds.End),
    };
});
