import { beforeEach, describe, expect, it, vi } from "vitest";

const serverMocks = vi.hoisted(() => {
    const dynamicProperties = new Map<string, boolean | number | string | object>();

    const world = {
        setDynamicProperty: vi.fn((identifier: string, value?: boolean | number | string | object) => {
            if (value === undefined) dynamicProperties.delete(identifier);
            else dynamicProperties.set(identifier, value);
        }),
        getDynamicProperty: vi.fn((identifier: string) => dynamicProperties.get(identifier)),
        getDynamicPropertyIds: vi.fn(() => [...dynamicProperties.keys()]),
        clearDynamicProperties: vi.fn(() => dynamicProperties.clear()),
        getDynamicPropertyTotalByteCount: vi.fn(() => 0),
        scoreboard: {
            getObjective: vi.fn(),
            addObjective: vi.fn(),
            removeObjective: vi.fn(),
            getObjectiveAtDisplaySlot: vi.fn(),
            setObjectiveAtDisplaySlot: vi.fn(),
        },
        afterEvents: {
            worldLoad: { subscribe: vi.fn() },
        },
    };

    return { world, dynamicProperties };
});

vi.mock("@minecraft/server", () => ({
    world: serverMocks.world,
    system: {
        run: vi.fn((cb: () => void) => cb()),
        runJob: vi.fn(),
    },
    DisplaySlotId: {},
    Entity: class {},
    Player: class {},
    ScoreboardIdentity: class {},
    ScoreboardObjective: class {},
    Vector3: Object,
}));

vi.mock("../../src/func", () => ({
    cmd: vi.fn(),
}));

vi.mock("../../src/utils/logger", () => ({
    Logger: class {
        warn = vi.fn();
        error = vi.fn();
    },
}));

import { DataBase, type DPSource } from "../../src/DataBase/DataBase";
import {
    CompactDPDataBase,
    CompactEncodeError,
    CompactStructCodec,
} from "../../src/DataBase/CompactDPDataBase";

function createDPSource() {
    const values = new Map<string, boolean | number | string | object>();
    const source: DPSource = {
        setDynamicProperty(identifier, value) {
            if (value === undefined) values.delete(identifier);
            else values.set(identifier, value);
        },
        getDynamicProperty(identifier) {
            return values.get(identifier) as any;
        },
        getDynamicPropertyIds() {
            return [...values.keys()];
        },
        clearDynamicProperties() {
            values.clear();
        },
        getDynamicPropertyTotalByteCount() {
            return 0;
        },
    };
    return { source, values };
}

describe("CompactStructCodec", () => {
    const codec = new CompactStructCodec([
        ["name", "string"],
        ["money", "int"],
        ["active", "boolean"],
    ] as const);

    it("按 schema 顺序编码为 JSON 数组，字符串分隔字符无需自定义转义", () => {
        const encoded = codec.encode({
            active: true,
            money: 10000,
            name: "a|:b",
        });

        expect(encoded).toBe('["a|:b",10000,1]');
        expect(codec.decode(encoded)).toEqual({
            ok: true,
            value: {
                name: "a|:b",
                money: 10000,
                active: true,
            },
        });
    });

    it("保留 int / number 语义并把 boolean 紧凑编码为 0/1", () => {
        const numberCodec = new CompactStructCodec([
            ["positive", "int"],
            ["negative", "int"],
            ["ratio", "number"],
            ["enabled", "boolean"],
        ] as const);

        const encoded = numberCodec.encode({
            positive: 10000,
            negative: -35,
            ratio: 12.5,
            enabled: false,
        });

        expect(encoded).toBe("[10000,-35,12.5,0]");
        expect(numberCodec.decode(encoded)).toEqual({
            ok: true,
            value: {
                positive: 10000,
                negative: -35,
                ratio: 12.5,
                enabled: false,
            },
        });
    });

    it("写入时拒绝缺字段、多字段、symbol 字段和错误类型", () => {
        expect(() =>
            codec.encode({
                name: "test",
                money: 1,
            } as any),
        ).toThrow(CompactEncodeError);

        expect(() =>
            codec.encode({
                name: "test",
                money: 1,
                active: true,
                extra: 1,
            } as any),
        ).toThrow(CompactEncodeError);

        const withSymbol = {
            name: "test",
            money: 1,
            active: true,
            [Symbol("extra")]: 1,
        };
        expect(() => codec.encode(withSymbol as any)).toThrow(CompactEncodeError);

        expect(() =>
            codec.encode({
                name: "test",
                money: 1.2,
                active: true,
            } as any),
        ).toThrow(/安全整数/);

        expect(() =>
            new CompactStructCodec([
                ["value", "number"],
            ] as const).encode({ value: Number.POSITIVE_INFINITY }),
        ).toThrow(/有限 number/);
    });

    it("schema 拒绝空 schema、重复字段、非法 options 和非末尾 default", () => {
        expect(() => new CompactStructCodec([] as const)).toThrow(/至少需要一个字段/);

        expect(() =>
            new CompactStructCodec([
                ["name", "string"],
                ["name", "string"],
            ] as const),
        ).toThrow(/字段名重复/);

        expect(() =>
            new CompactStructCodec([
                ["count", "int", { default: "bad" }],
            ] as any),
        ).toThrow(/安全整数/);

        expect(() =>
            new CompactStructCodec([
                ["count", "int", { default: 0, extra: true }],
            ] as any),
        ).toThrow(/只能包含 default/);

        expect(() =>
            new CompactStructCodec([
                ["bad", "string", { default: "" }, "extra"],
            ] as any),
        ).toThrow(/必须是 \[name, kind\]/);

        expect(() =>
            new CompactStructCodec([
                ["oldOptional", "int", { default: 0 }],
                ["requiredAfterIt", "string"],
            ] as const),
        ).toThrow(/必须全部位于 schema 末尾/);
    });

    it.each([
        ["not json", "invalid_json"],
        ['{"name":"A"}', "invalid_shape"],
        ['["A",1,1,"extra"]', "schema_mismatch"],
        ['["A",1.5,1]', "invalid_value"],
        ['["A",1,2]', "invalid_value"],
        ['["A",null,1]', "invalid_value"],
    ])("损坏数据 %s 返回明确错误 %s", (raw, code) => {
        const result = codec.decode(raw);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.code).toBe(code);
    });

    it("缺少必需的新尾字段会报错", () => {
        const result = codec.decode('["A",10]');

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe("missing_field");
            expect(result.error.field).toBe("active");
        }
    });

    it("只允许通过末尾 default 兼容字段数更少的旧记录", () => {
        const upgradedCodec = new CompactStructCodec([
            ["name", "string"],
            ["money", "int"],
            ["active", "boolean", { default: false }],
            ["level", "int", { default: 1 }],
        ] as const);

        const result = upgradedCodec.decode('["A",10]');

        expect(result).toEqual({
            ok: true,
            value: {
                name: "A",
                money: 10,
                active: false,
                level: 1,
            },
        });
    });

    it("旧 schema 读取字段更多的新记录时明确报 schema mismatch", () => {
        const oldCodec = new CompactStructCodec([
            ["name", "string"],
        ] as const);

        const result = oldCodec.decode('["A",10]');

        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.code).toBe("schema_mismatch");
    });

    it("特殊字段名仍返回普通对象自身属性", () => {
        const specialCodec = new CompactStructCodec([
            ["__proto__", "string"],
        ] as const);

        const result = specialCodec.decode('["safe"]');

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(Object.prototype.hasOwnProperty.call(result.value, "__proto__")).toBe(true);
            expect(result.value.__proto__).toBe("safe");
        }
    });
});

describe("CompactDPDataBase", () => {
    beforeEach(() => {
        delete DataBase.DBMap.compact_world_test;
        delete DataBase.DBMap.compact_entity_test;
        serverMocks.dynamicProperties.clear();
    });

    const fields = [
        ["name", "string"],
        ["money", "int"],
        ["active", "boolean"],
    ] as const;

    it("只通过结构化 API 写入位置数组并可正常读取", () => {
        const { source, values } = createDPSource();
        const db = new CompactDPDataBase("compact_entity_test", fields, source);

        db.set("player", {
            name: "小阳|x666",
            money: 10000,
            active: true,
        });

        expect(values.get("compact_entity_test.player_")).toBe('["小阳|x666",10000,1]');
        expect(db.get("player")).toEqual({
            name: "小阳|x666",
            money: 10000,
            active: true,
        });
    });

    it("read 能区分不存在与格式损坏，并保留损坏原数据", () => {
        const { source, values } = createDPSource();
        const db = new CompactDPDataBase("compact_entity_test", fields, source);

        expect(db.read("missing")).toEqual({ status: "missing" });

        values.set("compact_entity_test.bad_", '{"name":"bad"}');
        const result = db.read("bad");

        expect(result.status).toBe("invalid");
        if (result.status === "invalid") {
            expect(result.error.code).toBe("invalid_shape");
        }
        expect(db.get("bad")).toBeUndefined();
        expect(values.get("compact_entity_test.bad_")).toBe('{"name":"bad"}');
    });

    it("底层分片存在但缺失内容时报告 storage_corrupt，而不是 missing", () => {
        const { source, values } = createDPSource();
        const db = new CompactDPDataBase("compact_entity_test", fields, source);

        values.set("compact_entity_test.bad_arrlen", 1);

        const result = db.read("bad");
        expect(result.status).toBe("invalid");
        if (result.status === "invalid") {
            expect(result.error.code).toBe("storage_corrupt");
        }
    });

    it("非字符串旧值会作为格式错误处理", () => {
        const { source, values } = createDPSource();
        const db = new CompactDPDataBase("compact_entity_test", fields, source);

        values.set("compact_entity_test.bad_", 123);

        const result = db.read("bad");
        expect(result.status).toBe("invalid");
        if (result.status === "invalid") {
            expect(result.error.code).toBe("invalid_input");
        }
    });

    it("world 数据库全局注册的是结构化 facade", () => {
        const db = new CompactDPDataBase("compact_world_test", fields);

        expect(DataBase.getDB("compact_world_test")).toBe(db);
        expect(db.type).toBe("DP");
    });

    it("实体级紧凑数据库不会进入全局注册表", () => {
        const { source } = createDPSource();
        const db = new CompactDPDataBase("compact_entity_test", fields, source);

        expect(DataBase.getDB("compact_entity_test")).toBeUndefined();
        expect(DataBase.getDBs()).not.toContain(db);
    });
});
