import { generateUUID } from "./func";

export const libName = "SAPI-Pro";

export const packInfo: PackInfo = {
  name: "SAPI-Pro行为包", //行为包名
  version: 0.1, //行为包版本
  author: "不到啊", //作者
};

class LibConfigClass {
  forceHost = false;
  /**如果不想随机生成，可以自己改 */
  UUID = generateUUID();
  version = 0.3; //不要修改
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
  version: number;
  author: string;
  greeting?: string;
}
