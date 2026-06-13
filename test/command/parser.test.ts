// =====================================================
// Command Parser - Comprehensive Vitest Tests
// =====================================================
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Hoisted helpers: classes shared by mock and tests ─
const { MockPlayerClass, MockItemType, MockBlockType, MockEntityType, MockEntity } = vi.hoisted(
    () => {
        class MockPlayerClass {
            name = "Steve";
            id = "steve-uuid";
            sendMessage = vi.fn();
            getGameMode = vi.fn(() => "creative" as any);
            playerPermissionLevel: string = "operator";
            location = { x: 0, y: 0, z: 0 };
            dimension = { id: "minecraft:overworld" };
            constructor(overrides: Partial<MockPlayerClass> = {}) {
                Object.assign(this, overrides);
            }
        }
        class MockItemType {
            id: string;
            localizationKey = "item.mock";
            constructor(id: string) {
                this.id = id;
            }
        }
        class MockBlockType {
            id: string;
            localizationKey = "block.mock";
            constructor(id: string) {
                this.id = id;
            }
        }
        class MockEntityType {
            id: string;
            localizationKey = "entity.mock";
            constructor(id: string) {
                this.id = id;
            }
        }
        class MockEntity {
            id = "minecraft:creeper";
            typeId = "minecraft:creeper";
        }
        return { MockPlayerClass, MockItemType, MockBlockType, MockEntityType, MockEntity };
    }
);

// ─── Mock @minecraft/server ───────────────────────────
vi.mock("@minecraft/server", () => {
    return {
        Player: MockPlayerClass,
        ItemType: MockItemType,
        BlockType: MockBlockType,
        EntityType: MockEntityType,
        Entity: MockEntity,
        Vector3: Object,
        RawMessage: Object as any,
        system: {
            run: vi.fn((cb: () => void) => {
                cb();
                return 0 as any;
            }),
            runInterval: vi.fn(),
            beforeEvents: {
                startup: { subscribe: vi.fn() },
            },
            afterEvents: {
                scriptEventReceive: { subscribe: vi.fn() },
            },
        },
        world: {
            getAllPlayers: vi.fn(() => []),
            beforeEvents: {
                chatSend: { subscribe: vi.fn() },
            },
            afterEvents: {
                worldLoad: { subscribe: vi.fn() },
                itemUse: { subscribe: vi.fn() },
            },
        },
        PlayerPermissionLevel: {
            Operator: "operator",
            Member: "member",
        },
        GameMode: {
            Creative: "creative",
            Survival: "survival",
            Adventure: "adventure",
            Spectator: "spectator",
        },
        ItemTypes: {
            get: vi.fn((id: string) => new MockItemType(id)),
        },
        BlockTypes: {
            get: vi.fn((id: string) => new MockBlockType(id)),
        },
        EntityTypes: {
            get: vi.fn((id: string) => new MockEntityType(id)),
        },
        CustomCommandParamType: {
            Integer: "integer",
            Float: "float",
            Boolean: "boolean",
            String: "string",
            Enum: "enum",
            PlayerSelector: "player_selector",
            EntitySelector: "entity_selector",
            Location: "location",
            ItemType: "item_type",
            BlockType: "block_type",
            EntityType: "entity_type",
        },
        CustomCommandStatus: {
            Success: 0,
            Failure: 1,
        },
        CustomCommandSource: {
            Entity: "entity",
            Level: "level",
            Agent: "agent",
        },
        CommandPermissionLevel: {
            Any: 0,
            GameDirectors: 1,
            Console: 4,
            Host: 3,
            Internal: 2,
        },
    };
});

// ─── Mock internal modules with side effects ──────────
vi.mock("@/Event", () => ({
    chatOpe: { cancel: "cancel", skipsend: "skipsend" },
    chatBus: { subscribe: vi.fn() },
    intervalBus: { subscribetick: vi.fn(), subscribesec: vi.fn(), subscribemin: vi.fn() },
    itemBus: { bind: vi.fn() },
    ScriptEventBus: { bind: vi.fn() },
}));

vi.mock("@/Translate/translator", () => ({
    isRawMessage: (obj: any) => {
        if (!obj || typeof obj !== "object") return false;
        return (
            obj.rawtext !== undefined ||
            obj.score !== undefined ||
            obj.text !== undefined ||
            obj.translate !== undefined ||
            obj.with !== undefined
        );
    },
    translator: {
        setFallBack: vi.fn(),
        setEnabledLanguages: vi.fn(),
        setPlayerLang: vi.fn(),
        resetPlayerLang: vi.fn(),
        getPlayerLangId: vi.fn(),
        getLangKeyById: vi.fn(),
        getLangIdByKey: vi.fn(),
        createFor: vi.fn(),
        createPureFor: vi.fn(),
        createUniversal: vi.fn(),
        translate: vi.fn(),
    },
}));

// ─── Imports (after mocks) ───────────────────────────
import { BlockTypes, EntityTypes, GameMode, ItemTypes, system } from "@minecraft/server";
import { Command } from "../../src/Command/commandClass";
import { NativeCommandParser } from "../../src/Command/parser/nativeParser";

// =====================================================
//  Part 3: NativeCommandParser 测试
// =====================================================
describe("NativeCommandParser - 原生命令解析器测试", () => {
    let nativeParser: NativeCommandParser;
    let mockPlayer: any;
    let handlerSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(ItemTypes.get).mockImplementation(((id: string) => new MockItemType(id)) as any);
        vi.mocked(BlockTypes.get).mockImplementation(
            ((id: string) => new MockBlockType(id)) as any
        );
        vi.mocked(EntityTypes.get).mockImplementation(
            ((id: string) => new MockEntityType(id)) as any
        );

        nativeParser = new NativeCommandParser();
        mockPlayer = new MockPlayerClass() as any;
        mockPlayer.getGameMode = vi.fn(() => GameMode.Creative);
        handlerSpy = vi.fn() as any;
    });

    describe("基本类型解析", () => {
        it("应正确解析 int", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "count", type: "int" }]])
                .setHandler(handlerSpy);

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, [42]);
            expect(result.status).toBe(0);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { count: 42 });
        });

        it("应正确解析 float", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "val", type: "float" }]])
                .setHandler(handlerSpy);

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, [3.14]);
            expect(result.status).toBe(0);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { val: 3.14 });
        });

        it("应正确解析 boolean", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "flag", type: "boolean" }]])
                .setHandler(handlerSpy);

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, [true]);
            expect(result.status).toBe(0);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { flag: true });
        });

        it("应正确解析 string", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "msg", type: "string" }]])
                .setHandler(handlerSpy);

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, ["hello"]);
            expect(result.status).toBe(0);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { msg: "hello" });
        });

        it("应正确解析 enum", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "dir", type: "enum", enums: ["up", "down"] }]])
                .setHandler(handlerSpy);

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, ["up"]);
            expect(result.status).toBe(0);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { dir: "up" });
        });

        it("应拒绝无效的 enum 值", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "dir", type: "enum", enums: ["up", "down"] }]])
                .setHandler(handlerSpy);

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, ["sideways"]);
            expect(result.status).toBe(1);
            expect(handlerSpy).not.toHaveBeenCalled();
        });

        it("应正确解析 target (Player 数组 → 单个 Player)", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "p", type: "target" }]])
                .setHandler(handlerSpy);

            // 用 MockPlayerClass 实例创建数组，确保 instanceof 检查通过
            const targetPlayer = new MockPlayerClass({ name: "Target" }) as any;
            const result = nativeParser.parseAndExecute(cmd, mockPlayer, [[targetPlayer]]);
            expect(result.status).toBe(0);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { p: targetPlayer });
        });
    });

    describe("可选参数和默认值", () => {
        it("应使用默认值", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([
                    [
                        { name: "required", type: "int" },
                        { name: "optional", type: "boolean", optional: true, default: true },
                    ],
                ])
                .setHandler(handlerSpy);

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, [42]);
            expect(result.status).toBe(0);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, {
                required: 42,
                optional: true,
            });
        });

        it("省略可选参数时不传默认值则不在结果中", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([
                    [
                        { name: "required", type: "int" },
                        { name: "optional", type: "boolean", optional: true },
                    ],
                ])
                .setHandler(handlerSpy);

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, [42]);
            expect(result.status).toBe(0);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { required: 42 });
        });
    });

    describe("验证器", () => {
        it("命令验证器通过时应执行 handler", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "x", type: "int" }]])
                .setHandler(handlerSpy)
                .setValidator((p: any) => {
                    if (p.getGameMode() !== GameMode.Creative) return "需要创造模式";
                });

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, [42]);
            expect(result.status).toBe(0);
            expect(handlerSpy).toHaveBeenCalled();
        });

        it("命令验证器失败时应返回错误", () => {
            mockPlayer.getGameMode.mockReturnValue(GameMode.Survival);
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "x", type: "int" }]])
                .setHandler(handlerSpy)
                .setValidator((p: any) => {
                    if (p.getGameMode() !== GameMode.Creative) return "需要创造模式";
                });

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, [42]);
            expect(result.status).toBe(1);
            expect(handlerSpy).not.toHaveBeenCalled();
        });

        it("参数验证器通过时应正常", () => {
            const validator = vi.fn((value: number) => {
                if (value < 0) return "不能为负数";
            });
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "x", type: "int", validator }]])
                .setHandler(handlerSpy);

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, [42]);
            expect(result.status).toBe(0);
            expect(handlerSpy).toHaveBeenCalled();
        });

        it("参数验证器失败时应返回错误", () => {
            const validator = vi.fn((value: number) => {
                if (value < 0) return "不能为负数";
            });
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "x", type: "int", validator }]])
                .setHandler(handlerSpy);

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, [-5]);
            expect(result.status).toBe(1);
            expect(handlerSpy).not.toHaveBeenCalled();
        });
    });

    describe("错误情况", () => {
        it("缺少必填参数应返回错误", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([
                    [
                        { name: "a", type: "int" },
                        { name: "b", type: "int" },
                    ],
                ])
                .setHandler(handlerSpy);

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, [42]);
            expect(result.status).toBe(1);
            expect(handlerSpy).not.toHaveBeenCalled();
        });

        it("多余参数应返回错误", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "a", type: "int" }]])
                .setHandler(handlerSpy);

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, [42, 99]);
            expect(result.status).toBe(1);
            expect(handlerSpy).not.toHaveBeenCalled();
        });

        it("int 类型收到非数字应报错", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "a", type: "int" }]])
                .setHandler(handlerSpy);

            const result = nativeParser.parseAndExecute(cmd, mockPlayer, ["abc" as any]);
            expect(result.status).toBe(1);
            expect(handlerSpy).not.toHaveBeenCalled();
        });
    });
});
