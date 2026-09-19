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
        run: vi.fn(),
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
        warn() {}
        error() {}
    },
}));

import { DataBase, DPDataBase, type DPSource } from "../../src/DataBase/DataBase";

function createEntityDPSource(): DPSource {
    const values = new Map<string, boolean | number | string | object>();

    return {
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
}

describe("DPDataBase global registry", () => {
    beforeEach(() => {
        delete DataBase.DBMap.world_registry_test;
        delete DataBase.DBMap.shared_registry_test;
        delete DataBase.DBMap.entity_registry_test;
        serverMocks.dynamicProperties.clear();
    });

    it("registers world-backed DP databases globally", () => {
        const db = new DPDataBase("world_registry_test");

        expect(DataBase.getDB("world_registry_test")).toBe(db);
        expect(DataBase.getDBs()).toContain(db);
    });

    it("does not let an entity-backed DP database replace a global database with the same name", () => {
        const globalDb = new DPDataBase("shared_registry_test");
        const entityDb = new DPDataBase("shared_registry_test", createEntityDPSource());

        expect(DataBase.getDB("shared_registry_test")).toBe(globalDb);
        expect(DataBase.getDBs()).not.toContain(entityDb);
    });

    it("keeps entity-backed DP databases local while preserving DP reads and writes", () => {
        const source = createEntityDPSource();
        const entityDb = new DPDataBase("entity_registry_test", source);

        entityDb.set("value", 42);

        expect(entityDb.get("value")).toBe(42);
        expect(DataBase.getDB("entity_registry_test")).toBeUndefined();
        expect(DataBase.getDBs()).not.toContain(entityDb);
    });
});

describe("DPDataBase value representation", () => {
    beforeEach(() => {
        serverMocks.dynamicProperties.clear();
    });

    it("大字符串改写为小值后不再被旧分片遮蔽", () => {
        const db = new DPDataBase("representation_test", createEntityDPSource());
        const large = "x".repeat(11000);

        db.set("value", large);
        expect(db.get("value")).toBe(large);

        db.set("value", "small");

        expect(db.get("value")).toBe("small");
    });

    it("小值改写为大字符串再删除后不会恢复旧的小值", () => {
        const db = new DPDataBase("representation_test", createEntityDPSource());
        const large = "x".repeat(11000);

        db.set("value", "old");
        db.set("value", large);
        expect(db.get("value")).toBe(large);

        db.rm("value");

        expect(db.has("value")).toBe(false);
        expect(db.get("value")).toBeUndefined();
    });

    it("分片缺失时 has 仍可识别记录存在", () => {
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
        const db = new DPDataBase("representation_test", source);

        values.set("representation_test.value_arrlen", 1);

        expect(db.has("value")).toBe(true);
        expect(db.get("value")).toBeUndefined();
    });
});


describe("DPDataBase namespace isolation", () => {
    it("clear only removes properties inside the exact database namespace", () => {
        const source = createEntityDPSource();
        const db = new DPDataBase("abc", source);
        const neighbor = new DPDataBase("abcd", source);

        db.set("own", 1);
        neighbor.set("keep", 2);

        db.clear();

        expect(db.get("own")).toBeUndefined();
        expect(neighbor.get("keep")).toBe(2);
    });

    it("getrealKeys does not include databases that only share the name prefix", () => {
        const source = createEntityDPSource();
        const db = new DPDataBase("abc", source);
        const neighbor = new DPDataBase("abcd", source);

        db.set("own", 1);
        neighbor.set("other", 2);

        expect(db.getrealKeys()).toEqual(["abc.own_"]);
    });
});
