import { LibConfig, PackInfo } from "SAPI-Pro/Config";

const packInfo: PackInfo = {
    name: "SAPI-Pro行为包", //行为包名
    version: 0.1, //行为包版本
    author: "不到啊", //作者
};
// 注册包信息
LibConfig.regPackInfo(packInfo);
