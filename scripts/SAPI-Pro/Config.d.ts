export declare const libName = "SAPI-Pro";
export declare const packInfo: PackInfo;
export declare const LibConfig: Config;
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
export {};
