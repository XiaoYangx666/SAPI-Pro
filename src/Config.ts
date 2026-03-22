import { generateUUID } from "./func";

export const libName = "SAPI-Pro";

export const defaultPackInfo: PackInfo = {
    name: "SAPI-Pro行为包",
    version: "1.0",
    author: "不到啊",
    nameSpace: "sapipro",
    description: "这是SAPI-Pro示例行为包",
};

class LibConfigClass {
    /**库版本 */
    version = 0.4;
    /**是否是beta版库 */
    isBeta = false;
    /**是否是主行为包 */
    isHost = false;
    packInfo: PackInfo;

    constructor() {
        this.packInfo = defaultPackInfo;
        if (this.packInfo.uuid == undefined) {
            this.packInfo.uuid = generateUUID();
        }
    }

    regPackInfo(info: PackInfo) {
        this.packInfo = { ...this.packInfo, ...info };
    }
}

export const LibConfig = new LibConfigClass();

export interface PackInfo {
    name: string;
    /**包版本 */
    version: string;
    /**作者 */
    author: string;
    /**问候语 */
    greeting?: string;
    /**行为包命名空间 */
    nameSpace: string;
    /**包描述 */
    description: string;
    /**包唯一uuid */
    uuid?: string;
}
