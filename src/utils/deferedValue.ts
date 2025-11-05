export function createDeferredObject<T extends object>(): {
    setTarget: (obj: T) => void;
    proxy: T;
} {
    let target: T | null = null;

    const proxy = new Proxy({} as T, {
        get(_, prop) {
            if (!target) {
                throw new DeferredObjectError("对象未初始化，不能访问属性: " + String(prop));
            }
            return (target as any)[prop];
        },
    });

    return {
        setTarget(obj: T) {
            target = obj;
        },
        proxy,
    };
}

class DeferredObjectError extends Error {
    constructor(mes: string, options?: ErrorOptions) {
        super(mes, options);
        this.name = "DeferredObjectError";
    }
}
