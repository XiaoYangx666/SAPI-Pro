/**
 * 原生命令的枚举名计算。
 *
 * 两个渠道的原版 API 不同，必须分支。**枚举名一律要带命名空间**，否则 `registerEnum` 会抛
 * `NamespaceNameError: string must be prefixed with a namespace (eg. namespace:value)`。
 *
 * - **stable**（`@minecraft/server@2.10.0`）：`CustomCommandParameter` 只有 `name` / `type`，没有 `enumName`，
 *   运行时按「本包命名空间 + 参数名」查找枚举，所以枚举名必须是 `命名空间:参数名`。
 *   实测：注册成 `命名空间:命令_参数_序号` 会报
 *   `CustomCommandError: Custom Command depends on one or more unknown enums [参数名]`。
 * - **beta**：`CustomCommandParameter` 有 `enumName`（`@beta`），可以用 `命名空间:命令_参数_序号` 唯一名，
 *   把枚举名与参数名解耦，避免同包内不同命令的同名参数互相覆盖。
 *
 * 单独成模块是为了能对两条分支分别写单测（构建期的 `__BETA__` 常量在测试里跑不出 stable 分支）。
 */
export function nativeEnumName(
    isBeta: boolean,
    nameSpace: string,
    commandName: string,
    paramName: string,
    index: number
): string {
    return isBeta ? `${nameSpace}:${commandName}_${paramName}_${index}` : `${nameSpace}:${paramName}`;
}

/**
 * 原生命令里 enum / flag 参数在注册表中使用的 `name`。
 *
 * - **stable**：没有 `enumName`，运行时把「参数名」**逐字**当枚举名查表，而枚举名又必须带命名空间，
 *   所以参数名必须直接写成 `命名空间:参数名`。实测：枚举注册成 `命名空间:参数名` 但参数名写短名，
 *   会报 `CustomCommandError: ... unknown enums [参数名]`。
 *   参数名不参与命令语法与参数解析（`NativeCommandParser` 按位置映射到定义里的参数名），所以这样写没有副作用。
 * - **beta**：参数名保持短名，用 `enumName` 指向唯一枚举名。
 */
export function nativeEnumParamName(isBeta: boolean, paramName: string, enumName: string): string {
    return isBeta ? paramName : enumName;
}
