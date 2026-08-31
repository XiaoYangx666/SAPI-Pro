import { chatBusClass } from "./chatBusClass";

/**
 * chatBus 实例：唯一的 beta-only 导出。
 *
 * 实例本身是共享源码，但只有 beta 渠道的入口（entry.beta.ts / Event.entry.beta.ts）re-export 它，
 * stable 渠道的入口不引用本模块 → stable 的 d.ts 没有 chatBus 导出。
 * 运行时 stable 的产物里本模块经 treeshake.moduleSideEffects 剔除（实例无需创建）。
 */
export const chatBus = new chatBusClass();
