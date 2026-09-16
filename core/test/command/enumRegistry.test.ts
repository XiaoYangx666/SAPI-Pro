// =====================================================
// 原生命令枚举注册规划 - 同名冲突处理测试
//
// 背景：stable（@minecraft/server 2.10.0）没有 enumName，枚举名必须等于参数名，
// 同一个包里两条命令「同名参数 + 不同枚举值」时第二次 registerEnum 会撞名。
// 规划函数负责改名，applyEnumRenames 负责把命令参数里的引用一起改掉。
// =====================================================
import { describe, it, expect } from "vitest";
import { applyEnumRenames, planEnumRegistrations } from "../../src/Command/enumRegistry";

const NS = "mypack";

describe("原生命令枚举注册规划", () => {
    it("首次注册：原名直接注册，无改名", () => {
        const registered = new Map<string, string>();
        const plan = planEnumRegistrations(NS, "cmdA", { "mypack:fruit": ["apple", "banana"] }, registered);
        expect(plan.toRegister).toEqual([["mypack:fruit", ["apple", "banana"]]]);
        expect(plan.renames.size).toBe(0);
    });

    it("同名同值：跳过注册（复用已有的）", () => {
        const registered = new Map<string, string>([["mypack:fruit", JSON.stringify(["apple", "banana"])]]);
        const plan = planEnumRegistrations(NS, "cmdB", { "mypack:fruit": ["apple", "banana"] }, registered);
        expect(plan.toRegister).toHaveLength(0);
        expect(plan.renames.size).toBe(0);
    });

    it("同名不同值：改成 命名空间:命令名_参数名，并记录改名映射", () => {
        const registered = new Map<string, string>([["mypack:fruit", JSON.stringify(["apple"])]]);
        const plan = planEnumRegistrations(NS, "cmdB", { "mypack:fruit": ["red", "blue"] }, registered);
        expect(plan.toRegister).toEqual([["mypack:cmdB_fruit", ["red", "blue"]]]);
        expect(plan.renames.get("mypack:fruit")).toBe("mypack:cmdB_fruit");
    });

    it("改名后又撞名：继续补序号", () => {
        const registered = new Map<string, string>([
            ["mypack:fruit", JSON.stringify(["apple"])],
            ["mypack:cmdB_fruit", JSON.stringify(["other"])],
        ]);
        const plan = planEnumRegistrations(NS, "cmdB", { "mypack:fruit": ["red"] }, registered);
        expect(plan.toRegister).toEqual([["mypack:cmdB_fruit_1", ["red"]]]);
        expect(plan.renames.get("mypack:fruit")).toBe("mypack:cmdB_fruit_1");
    });

    it("同一次规划里两个参数互不影响", () => {
        const registered = new Map<string, string>();
        const plan = planEnumRegistrations(
            NS,
            "cmdA",
            { "mypack:fruit": ["apple"], "mypack:color": ["red"] },
            registered
        );
        expect(plan.toRegister).toHaveLength(2);
        expect(plan.renames.size).toBe(0);
    });
});

describe("按规划改写命令参数引用", () => {
    it("stable 形态：改参数的 name（名字就是枚举名）", () => {
        const cmd = {
            mandatoryParameters: [{ name: "mypack:fruit", type: "Enum" }],
            optionalParameters: [{ name: "mypack:color", type: "Enum" }],
        };
        applyEnumRenames(cmd, new Map([["mypack:fruit", "mypack:cmdB_fruit"]]));
        expect(cmd.mandatoryParameters[0].name).toBe("mypack:cmdB_fruit");
        expect(cmd.optionalParameters[0].name).toBe("mypack:color");
    });

    it("beta 形态：改参数的 enumName，短参数名保持不动", () => {
        const cmd = {
            mandatoryParameters: [{ name: "fruit", type: "Enum", enumName: "mypack:cmdA_fruit_0" }],
        };
        applyEnumRenames(cmd, new Map([["mypack:cmdA_fruit_0", "mypack:cmdB_fruit"]]));
        expect(cmd.mandatoryParameters[0].enumName).toBe("mypack:cmdB_fruit");
        expect(cmd.mandatoryParameters[0].name).toBe("fruit");
    });

    it("没有改名时不改动任何东西", () => {
        const cmd = { mandatoryParameters: [{ name: "mypack:fruit", type: "Enum" }] };
        const before = JSON.stringify(cmd);
        applyEnumRenames(cmd, new Map());
        expect(JSON.stringify(cmd)).toBe(before);
    });

    it("优先改 enumName：即使 name 恰好也在改名表里，也不误改参数名", () => {
        const cmd = { mandatoryParameters: [{ name: "mypack:fruit", type: "Enum", enumName: "mypack:x_0" }] };
        applyEnumRenames(
            cmd,
            new Map([
                ["mypack:x_0", "mypack:new"],
                ["mypack:fruit", "mypack:other"],
            ])
        );
        expect(cmd.mandatoryParameters[0].enumName).toBe("mypack:new");
        expect(cmd.mandatoryParameters[0].name).toBe("mypack:fruit");
    });
});
