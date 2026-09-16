// =====================================================
// 原生命令枚举名 - 渠道差异回归测试
//
// 背景（均为实机踩到的报错）：
// 1. 枚举名必须带命名空间，否则 registerEnum 抛
//    NamespaceNameError: string must be prefixed with a namespace (eg. namespace:value)
// 2. stable（@minecraft/server 2.10.0）的 CustomCommandParameter 没有 enumName 字段，
//    运行时按「本包命名空间 + 参数名」查枚举；注册成别的名字会抛
//    CustomCommandError: Custom Command depends on one or more unknown enums [参数名]
// 3. beta 有 enumName，可以用唯一名把枚举名与参数名解耦
// =====================================================
import { describe, it, expect } from "vitest";
import { nativeEnumName, nativeEnumParamName } from "../../src/Command/enumName";

describe("原生命令枚举名", () => {
    it("stable 渠道：命名空间 + 参数名（运行时按此查找，且必须带命名空间）", () => {
        expect(nativeEnumName(false, "mypack", "enumtest", "fruit", 0)).toBe("mypack:fruit");
        // 序号与命令名不参与，多个枚举参数各自用「命名空间:参数名」
        expect(nativeEnumName(false, "mypack", "enumtest", "color", 3)).toBe("mypack:color");
    });

    it("beta 渠道：用「命名空间:命令_参数_序号」唯一名，避免同名参数互相覆盖", () => {
        expect(nativeEnumName(true, "mypack", "enumtest", "fruit", 0)).toBe("mypack:enumtest_fruit_0");
        expect(nativeEnumName(true, "mypack", "enumtest", "fruit", 1)).toBe("mypack:enumtest_fruit_1");
    });

    it("两条渠道的枚举名都必须带命名空间", () => {
        for (const isBeta of [false, true]) {
            const name = nativeEnumName(isBeta, "mypack", "cmd", "p", 7);
            expect(name.startsWith("mypack:")).toBe(true);
            expect(name.includes(":")).toBe(true);
        }
    });
});

describe("原生命令 enum/flag 参数的 name", () => {
    it("stable：参数名就是带命名空间的枚举名（运行时逐字查表）", () => {
        expect(nativeEnumParamName(false, "fruit", "mypack:fruit")).toBe("mypack:fruit");
    });

    it("beta：参数名保持短名，靠 enumName 指向唯一枚举名", () => {
        expect(nativeEnumParamName(true, "fruit", "mypack:enumtest_fruit_0")).toBe("fruit");
    });

    it("stable 的参数名必须与注册的枚举名一致，否则运行时报 unknown enums", () => {
        const enumName = nativeEnumName(false, "mypack", "enumtest", "fruit", 0);
        expect(nativeEnumParamName(false, "fruit", enumName)).toBe(enumName);
    });
});
