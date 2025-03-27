import { generateUUID } from "./func";

export const libName = "SAPI-Pro";

export const packInfo: PackInfo = {
  name: "SAPI-Pro行为包", //行为包名
  version: 0.1, //行为包版本
  author: "不到啊", //作者
};

export const LibConfig: Config = {
  /**
   * 将会自动将版本设为999
   * 但如果有其他行为包也选择forceHost
   * 则仍会竞争选择
   */
  forceHost: false,
  /**如果不想随机生成，可以自己改 */
  UUID: generateUUID(),
  version: 0.2, //不要修改
  isHost: false, //不要修改
  packInfo: packInfo, //在上面改
};

interface Config {
  version: number;
  packInfo: PackInfo;
  isHost: boolean;
  UUID: string;
  forceHost: boolean;
  [key: string]: any;
}

export interface PackInfo {
  name: string;
  version: number;
  author: string;
}
