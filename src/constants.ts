import { Dimension, world } from "@minecraft/server";
import { createDeferredObject } from "./utils/deferedValue";
import { DimensionIds } from "./utils/vanila-data";

//维度常量
type Dimensions = {
    [K in keyof typeof DimensionIds]: Dimension;
};
const { proxy: dims, setTarget } = createDeferredObject<Dimensions>();
world.afterEvents.worldLoad.subscribe(() => {
    setTarget({
        Overworld: world.getDimension(DimensionIds.Overworld),
        Nether: world.getDimension(DimensionIds.Nether),
        End: world.getDimension(DimensionIds.End),
    });
});
export const Dimensions = dims;
