import { generateUUID } from "./func";

export const libName = "SAPI-Pro";

export const packInfo: PackInfo = {
    name: "SAPI-Pro行为包", //行为包名
    version: "1.0", //行为包版本
    author: "不到啊", //作者
    nameSpace: "sapipro", //命名空间
    description: "这是SAPI-Pro示例行为包", //包描述(可以写教程之类的)
};

class LibConfigClass {
    forceHost = false;
    /**如果不想随机生成，可以自己改 */
    UUID = generateUUID();
    version = 0.32; //不要修改
    isHost = false; //不要修改
    packInfo: PackInfo; //在上面改

    constructor() {
        this.packInfo = packInfo;
    }

    regPackInfo(info: PackInfo) {
        this.packInfo = info;
    }
}

export const LibConfig = new LibConfigClass();

export interface PackInfo {
    name: string;
    version: string;
    author: string;
    greeting?: string;
    /**行为包命名空间 */
    nameSpace: string;
    description: string;
}
