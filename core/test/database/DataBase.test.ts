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
        runJob: vi.fn((job: Generator) => {
            for (const _ of job) { /* advance the mock job to completion */ }
        }),
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

describe("DPDataBase key parsing and damaged record cleanup", () => {
    it("lists keys with underscores and suffix-like names exactly once", () => {
        const source = createEntityDPSource();
        const db = new DPDataBase("key_parse_test", source);
        db.set("table_state", "x".repeat(11000));
        db.set("table_state_arrlen", 1);
        db.set("a.b_c", "value");

        expect(db.keys()).toEqual(["table_state", "table_state_arrlen", "a.b_c"]);
        expect(db.entries()).toEqual([
            ["table_state", "x".repeat(11000)],
            ["table_state_arrlen", 1],
            ["a.b_c", "value"],
        ]);
    });

    it("removes a damaged length marker and its chunks without touching neighboring keys", () => {
        const source = createEntityDPSource();
        const db = new DPDataBase("damage_test", source);
        const neighbor = new DPDataBase("damage_test_other", source);
        db.set("state_arr1", "another key");
        neighbor.set("state", "another database");
        source.setDynamicProperty("damage_test.state_arrlen", "corrupt");
        source.setDynamicProperty("damage_test.state_arr0", "first");
        source.setDynamicProperty("damage_test.state_arr12", "later");

        expect(db.has("state")).toBe(true);
        db.rm("state");

        expect(db.has("state")).toBe(false);
        expect(source.getDynamicProperty("damage_test.state_arrlen")).toBeUndefined();
        expect(source.getDynamicProperty("damage_test.state_arr0")).toBeUndefined();
        expect(source.getDynamicProperty("damage_test.state_arr12")).toBeUndefined();
        expect(db.get("state_arr1")).toBe("another key");
        expect(neighbor.get("state")).toBe("another database");
    });

    it("cleans malformed numeric length markers without unbounded loops", () => {
        const source = createEntityDPSource();
        const db = new DPDataBase("damage_number_test", source);
        source.setDynamicProperty("damage_number_test.state_arrlen", Number.NaN);
        source.setDynamicProperty("damage_number_test.state_arr0", "fragment");

        db.rm("state");

        expect(db.has("state")).toBe(false);
        expect(source.getDynamicPropertyIds()).toEqual([]);
    });
});

describe("DPDataBase corrupted chunk validation", () => {
    it.each([0, -1, 1.5, 1025, 1_000_000_000, Number.NaN, Infinity])(
        "does not allocate or loop over damaged chunk length %s",
        (length) => {
            const source = createEntityDPSource();
            const db = new DPDataBase("bounds_test", source);
            source.setDynamicProperty("bounds_test.state_arrlen", length);
            source.setDynamicProperty("bounds_test.state_arr0", "fragment");
            source.setDynamicProperty("bounds_test.state_", "stale");

            expect(db.get("state")).toBeUndefined();
            expect(db.has("state")).toBe(true);
            db.rm("state");
            expect(db.has("state")).toBe(false);
            expect(source.getDynamicPropertyIds()).toEqual([]);
        },
    );

    it("does not return an old direct value when an invalid string chunk marker remains", () => {
        const source = createEntityDPSource();
        const db = new DPDataBase("bounds_test", source);
        source.setDynamicProperty("bounds_test.state_", "old");
        source.setDynamicProperty("bounds_test.state_arrlen", "invalid");
        expect(db.get("state")).toBeUndefined();

        db.set("state", "new");
        expect(db.get("state")).toBe("new");
        expect(source.getDynamicProperty("bounds_test.state_arrlen")).toBeUndefined();
    });

    it("replaces a damaged huge marker with a new chunked value without trusting old length", () => {
        const source = createEntityDPSource();
        const db = new DPDataBase("bounds_test", source);
        source.setDynamicProperty("bounds_test.state_arrlen", 1_000_000_000);
        source.setDynamicProperty("bounds_test.state_arr0", "stale");
        source.setDynamicProperty("bounds_test.state_arr20", "orphan");
        const large = "x".repeat(11000);

        db.set("state", large);
        expect(db.get("state")).toBe(large);
        expect(source.getDynamicProperty("bounds_test.state_arr20")).toBeUndefined();
        db.rm("state");
        expect(source.getDynamicPropertyIds()).toEqual([]);
    });

    it("supports async replacement of corrupt markers for small and chunked values", async () => {
        const source = createEntityDPSource();
        const db = new DPDataBase("bounds_test", source);
        source.setDynamicProperty("bounds_test.state_arrlen", "invalid");
        source.setDynamicProperty("bounds_test.state_arr0", "old");

        await db.setAsync("state", "small");
        expect(db.get("state")).toBe("small");
        expect(source.getDynamicProperty("bounds_test.state_arr0")).toBeUndefined();

        await db.setAsync("state", "y".repeat(11000));
        expect(db.get("state")).toBe("y".repeat(11000));
        await db.setAsync("state", "final");
        expect(db.get("state")).toBe("final");
        expect(source.getDynamicPropertyIds()).toEqual(["bounds_test.state_"]);
    });
    it("reads a complete legacy record with 2000 chunks without an artificial write-format limit", () => {
        const source = createEntityDPSource();
        const db = new DPDataBase("legacy_large", source);
        source.setDynamicProperty("legacy_large.value_arrlen", 2000);
        for (let i = 0; i < 2000; i++) {
            source.setDynamicProperty(`legacy_large.value_arr${i}`, "x");
        }

        expect(db.get("value")).toBe("x".repeat(2000));
        db.rm("value");
        expect(source.getDynamicPropertyIds()).toEqual([]);
    });

    it("rejects oversized markers with missing or non-contiguous fragments before allocating an array", () => {
        const source = createEntityDPSource();
        const db = new DPDataBase("large_corrupt", source);
        source.setDynamicProperty("large_corrupt.value_arrlen", 2000);
        for (let i = 0; i < 1999; i++) {
            source.setDynamicProperty(`large_corrupt.value_arr${i}`, "x");
        }
        source.setDynamicProperty("large_corrupt.value_", "outdated");

        expect(db.get("value")).toBeUndefined();
        // Count matches but one index falls outside [0, 2000) -- still invalid.
        source.setDynamicProperty("large_corrupt.value_arr2000", "x");
        expect(db.get("value")).toBeUndefined();
    });

    it("uses direct-key operations without enumerating DP ids for normal writes and removals", () => {
        const source = createEntityDPSource();
        const db = new DPDataBase("fast_path", source);
        const getIds = vi.spyOn(source, "getDynamicPropertyIds");
        db.set("plain", "value");
        db.rm("plain");
        db.set("chunked", "x".repeat(11000));
        db.set("chunked", "y".repeat(11000));
        db.set("chunked", "small");
        db.set("chunked", "z".repeat(11000));
        db.rm("chunked");

        expect(db.get("chunked")).toBeUndefined();
        expect(db.get("plain")).toBeUndefined();
        expect(getIds).not.toHaveBeenCalled();
    });

    it("enumerates only when a malformed marker requires removal or replacement cleanup", () => {
        const source = createEntityDPSource();
        const db = new DPDataBase("orphan", source);
        const getIds = vi.spyOn(source, "getDynamicPropertyIds");
        db.set("state_arr20", "neighbor key");
        db.set("state_other", "neighbor key");
        source.setDynamicProperty("orphan.state_arrlen", "corrupt");
        source.setDynamicProperty("orphan.state_arr0", "first");
        source.setDynamicProperty("orphan.state_arr20", "orphan");
        db.rm("state");

        expect(getIds).toHaveBeenCalledTimes(1);
        expect(source.getDynamicProperty("orphan.state_arr0")).toBeUndefined();
        expect(source.getDynamicProperty("orphan.state_arr20")).toBeUndefined();
        expect(db.get("state_arr20")).toBe("neighbor key");
        expect(db.get("state_other")).toBe("neighbor key");

        source.setDynamicProperty("orphan.state_arrlen", 1_000_000_000);
        source.setDynamicProperty("orphan.state_arr17", "orphan");
        db.set("state", "x".repeat(11000));
        expect(source.getDynamicProperty("orphan.state_arr17")).toBeUndefined();
        expect(db.get("state")).toBe("x".repeat(11000));
        expect(getIds).toHaveBeenCalledTimes(2);
    });

    it("cleans normal chunk tails using the old length without enumerating", () => {
        const source = createEntityDPSource();
        const db = new DPDataBase("overwrite", source);
        const getIds = vi.spyOn(source, "getDynamicPropertyIds");
        const longValue = "x".repeat(22000);
        const shortValue = "y".repeat(11000);
        db.set("key", longValue);
        const oldCount = source.getDynamicProperty("overwrite.key_arrlen") as number;
        db.set("key", shortValue);
        const newCount = source.getDynamicProperty("overwrite.key_arrlen") as number;

        expect(db.get("key")).toBe(shortValue);
        for (let i = newCount; i < oldCount; i++) {
            expect(source.getDynamicProperty(`overwrite.key_arr${i}`)).toBeUndefined();
        }
        expect(getIds).not.toHaveBeenCalled();
    });

});
