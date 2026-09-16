/**
 * 原生命令枚举的注册规划。
 *
 * stable 渠道（`@minecraft/server@2.10.0`）没有 `enumName`，枚举名必须等于参数名，
 * 所以同一个包里两条命令用**同名参数但枚举值不同**时，第二次 `registerEnum` 会撞名。
 * 这里在注册前把每条命令的枚举表规划成「真正要注册的枚举」+「需要改名的引用」：
 *
 * - 名字没注册过 → 原样注册
 * - 同名同值 → 跳过（复用已注册的）
 * - 同名不同值 → 换成 `${命名空间}:${命令名}_${原名去掉命名空间}`；若还撞，再补序号
 *
 * 改名后由调用方（`CommandManager.registerNativeCommands`）同步改写命令参数里的引用：
 * stable 改参数 `name`（参数名就是枚举名），beta 改 `enumName`。
 */
export interface EnumRegistrationPlan {
    /** 真正需要调用 registerEnum 的枚举：名字 → 值 */
    toRegister: [string, string[]][];
    /** 被改名的枚举：原名 → 新名 */
    renames: Map<string, string>;
}

export function planEnumRegistrations(
    nameSpace: string,
    commandName: string,
    enums: Record<string, string[]>,
    registered: ReadonlyMap<string, string>
): EnumRegistrationPlan {
    const toRegister: [string, string[]][] = [];
    const renames = new Map<string, string>();
    // 副本：同一次规划里前后条目互相可见
    const taken = new Map(registered);

    for (const [enumName, enumValues] of Object.entries(enums)) {
        const signature = JSON.stringify(enumValues);
        const prev = taken.get(enumName);
        // 同名同值：已经注册过，直接复用
        if (prev === signature) continue;

        let finalName = enumName;
        if (prev !== undefined) {
            // 同名不同值：换一个带命名空间的唯一名
            const local = enumName.includes(":") ? enumName.slice(enumName.indexOf(":") + 1) : enumName;
            finalName = `${nameSpace}:${commandName}_${local}`;
            if (taken.has(finalName)) {
                let i = 1;
                while (taken.has(`${finalName}_${i}`)) i++;
                finalName = `${finalName}_${i}`;
            }
            renames.set(enumName, finalName);
        }

        taken.set(finalName, signature);
        toRegister.push([finalName, enumValues]);
    }

    return { toRegister, renames };
}

/** 按规划改写命令参数里的枚举引用：stable 用 `name` 指向枚举，beta 用 `enumName` */
export function applyEnumRenames(
    cmd: { mandatoryParameters?: any[]; optionalParameters?: any[] },
    renames: ReadonlyMap<string, string>
): void {
    if (renames.size === 0) return;
    for (const list of [cmd.mandatoryParameters, cmd.optionalParameters]) {
        if (!list) continue;
        for (const param of list) {
            if (typeof param?.enumName === "string" && renames.has(param.enumName)) {
                param.enumName = renames.get(param.enumName);
            } else if (typeof param?.name === "string" && renames.has(param.name)) {
                param.name = renames.get(param.name);
            }
        }
    }
}
