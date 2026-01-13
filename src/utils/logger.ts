import { defaultPackInfo } from "../Config";

export enum logLevel {
    debug = 0,
    info = 1,
    warn = 2,
    error = 3,
}

let namespace = defaultPackInfo.nameSpace;

export function setLoggerNamespace(ns: string) {
    namespace = ns;
}

export class Logger {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    debug(message: string, ...optionalParams: any[]) {
        console.debug(`<${namespace}>[${this.name}] ${message}`, ...this.stringfy(optionalParams));
    }

    log(message: string, ...optionalParams: any[]) {
        console.log(`<${namespace}>[${this.name}] ${message}`, ...this.stringfy(optionalParams));
    }
    warn(message: string, ...optionalParams: any[]) {
        console.warn(`<${namespace}>[${this.name}] ${message}`, ...this.stringfy(optionalParams));
    }
    /**
     * 打印错误信息
     * @param message 消息
     * @param e 错误
     */
    error(message: string, e?: unknown, ...optionalParams: any[]) {
        if (e instanceof Error) {
            console.error(`<${namespace}>[${this.name}] ${message}`, e, e.stack, ...this.stringfy(optionalParams));
        } else {
            console.error(`<${namespace}>[${this.name}] ${message}`, e, ...this.stringfy(optionalParams));
        }
    }

    private stringfy(optionalParams: any[]) {
        const params = optionalParams.map((p) => {
            if (p !== null && typeof p === "object") {
                try {
                    return JSON.stringify(p);
                } catch {
                    return "[无法序列化Object]";
                }
            }
            return p;
        });
        return params;
    }
}

export const LibLogger = new Logger("SAPI-Pro");
