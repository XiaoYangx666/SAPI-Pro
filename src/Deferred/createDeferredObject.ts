import { gameDeferredRegistry } from "./DeferredRegistry";

export function worldDeferredObject<T extends object>(binder: () => T | Promise<T>): T {
    let target: T | null = null;

    const proxy = new Proxy({} as T, {
        get(_, prop) {
            if (!target) {
                throw new DeferredObjectError("对象未初始化，不能访问属性: " + String(prop));
            }
            return (target as any)[prop];
        },
        set(_, prop, value) {
            if (!target) {
                throw new DeferredObjectError("对象未初始化，不能设置属性: " + String(prop));
            }
            (target as any)[prop] = value;
            return true;
        },
    });

    gameDeferredRegistry.register(async () => {
        target = await binder();
    });

    return proxy;
}

export type DeferredValue<T> = { value: T };

export function createDeferredValue<T extends Object>(
    binder: () => T,
    recreateOnAccess?: boolean
): DeferredValue<T> {
    let target: T | null = null;
    const recreate = recreateOnAccess ?? false;

    const wrapper = {
        get value() {
            if (recreate) {
                // 每次访问都创建新对象
                target = binder();
            } else {
                // 只创建一次（lazy）
                if (!target) {
                    target = binder();
                }
            }
            return target;
        },
        set value(newValue: T) {
            target = newValue;
        },
    };

    return wrapper;
}

class DeferredObjectError extends Error {
    constructor(mes: string, options?: ErrorOptions) {
        super(mes, options);
        this.name = "DeferredObjectError";
    }
}
