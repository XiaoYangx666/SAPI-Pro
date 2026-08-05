// =====================================================
// Command Parser - Comprehensive Vitest Tests
// =====================================================
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Hoisted helpers: classes shared by mock and tests ─
const { MockPlayerClass, MockItemType, MockBlockType, MockEntityType, MockEntity } =
    vi.hoisted(() => {
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
    });

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
import { CommandParser } from "../../src/Command/parser/parser";
import { paramParser } from "../../src/Command/parser/ParamTypes";
import { Command } from "../../src/Command/commandClass";
import { ParseInfo, ParseError, ParamObject } from "../../src/Command/interface";
import { NativeCommandParser } from "../../src/Command/parser/nativeParser";
import { LibConfig } from "../../src/Config";
import {
    ItemType,
    GameMode,
    system,
    world,
    ItemTypes,
    BlockTypes,
    EntityTypes,
} from "@minecraft/server";

// =====================================================
//  Part 1: paramParser 单元测试
// =====================================================
describe("paramParser - 参数级解析单元测试", () => {
    const mockPlayer = new MockPlayerClass();

    describe("int 整数类型", () => {
        it("应解析正整数", () => {
            const result = paramParser.int.parser(["42"], {
                player: mockPlayer as any,
                param: { name: "count", type: "int" },
                paramStrings: ["42"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBe(42);
        });

        it("应解析负整数", () => {
            const result = paramParser.int.parser(["-7"], {
                player: mockPlayer as any,
                param: { name: "count", type: "int" },
                paramStrings: ["-7"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBe(-7);
        });

        it("应拒绝非数字字符串", () => {
            const result = paramParser.int.parser(["abc"], {
                player: mockPlayer as any,
                param: { name: "count", type: "int" },
                paramStrings: ["abc"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseError);
        });

        it("parseInt 会将浮点数字符串转为整数（regex 层拦截）", () => {
            // parseInt("3.14") === 3，所以 parser 函数本身返回 ParseInfo(3)
            // 但在完整解析流程中，regex 会拦截 "3.14"
            const result = paramParser.int.parser(["3.14"], {
                player: mockPlayer as any,
                param: { name: "count", type: "int" },
                paramStrings: ["3.14"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBe(3);
        });
    });

    describe("float 浮点类型", () => {
        it("应解析普通浮点数", () => {
            const result = paramParser.float.parser(["3.14"], {
                player: mockPlayer as any,
                param: { name: "value", type: "float" },
                paramStrings: ["3.14"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBeCloseTo(3.14);
        });

        it("应解析整数为浮点数", () => {
            const result = paramParser.float.parser(["42"], {
                player: mockPlayer as any,
                param: { name: "value", type: "float" },
                paramStrings: ["42"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBeCloseTo(42);
        });

        it("应解析以 . 开头的浮点数", () => {
            const result = paramParser.float.parser([".5"], {
                player: mockPlayer as any,
                param: { name: "value", type: "float" },
                paramStrings: [".5"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBeCloseTo(0.5);
        });

        it("应拒绝非数字", () => {
            const result = paramParser.float.parser(["abc"], {
                player: mockPlayer as any,
                param: { name: "value", type: "float" },
                paramStrings: ["abc"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseError);
        });
    });

    describe("boolean 布尔类型", () => {
        it('应解析 "true" 为 true', () => {
            const result = paramParser.boolean.parser(["true"], {
                player: mockPlayer as any,
                param: { name: "flag", type: "boolean" },
                paramStrings: ["true"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBe(true);
        });

        it('应解析 "false" 为 false', () => {
            const result = paramParser.boolean.parser(["false"], {
                player: mockPlayer as any,
                param: { name: "flag", type: "boolean" },
                paramStrings: ["false"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBe(false);
        });
    });

    describe("string 字符串类型", () => {
        it("应返回原字符串", () => {
            const result = paramParser.string.parser(["hello"], {
                player: mockPlayer as any,
                param: { name: "msg", type: "string" },
                paramStrings: ["hello"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBe("hello");
        });

        it("应去除字符串外层的引号", () => {
            const result = paramParser.string.parser(['"hello world"'], {
                player: mockPlayer as any,
                param: { name: "msg", type: "string" },
                paramStrings: ['"hello world"'],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBe("hello world");
        });
    });

    describe("enum 枚举类型", () => {
        const enumParam: ParamObject = {
            name: "mode",
            type: "enum",
            enums: ["up", "down", "left", "right"],
        };

        it("应解析有效的枚举值", () => {
            const result = paramParser.enum.parser(["up"], {
                player: mockPlayer as any,
                param: enumParam,
                paramStrings: ["up"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBe("up");
        });

        it("应拒绝无效的枚举值", () => {
            const result = paramParser.enum.parser(["sideways"], {
                player: mockPlayer as any,
                param: enumParam,
                paramStrings: ["sideways"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseError);
        });
    });

    describe("target 目标选择器", () => {
        it('应解析 "@s" 为当前玩家', () => {
            const player = new MockPlayerClass({ name: "Steve" });
            const result = paramParser.target.parser(
                ['"s"', "s"],
                {
                    player: player as any,
                    param: { name: "target", type: "target" },
                    paramStrings: ['"s"'],
                    index: 0,
                }
            );
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBe(player);
        });

        it("应解析玩家名 (在线玩家)", () => {
            const alice = new MockPlayerClass({ name: "Alice", id: "alice-uuid" });
            const bob = new MockPlayerClass({ name: "Bob", id: "bob-uuid" });
            vi.mocked(world.getAllPlayers).mockReturnValue([alice, bob] as any);

            const result = paramParser.target.parser(["Alice", undefined, "Alice"] as any, {
                player: new MockPlayerClass() as any,
                param: { name: "target", type: "target" },
                paramStrings: ["Alice"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBe(alice);
        });

        it("应拒绝不存在的玩家名", () => {
            vi.mocked(world.getAllPlayers).mockReturnValue([]);

            const result = paramParser.target.parser(["NonExistent", undefined, "NonExistent"] as any, {
                player: new MockPlayerClass() as any,
                param: { name: "target", type: "target" },
                paramStrings: ["NonExistent"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseError);
        });
    });

    describe("position 坐标类型", () => {
        it("应解析绝对坐标 (x y z)", () => {
            const result = paramParser.position.parser(["1"] as any, {
                player: new MockPlayerClass() as any,
                param: { name: "pos", type: "position" },
                paramStrings: ["1", "2", "3"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            const info = result as ParseInfo;
            expect(info.value).toEqual({ x: 1, y: 2, z: 3 });
        });

        it("应解析相对坐标 (~ ~ ~)", () => {
            const player = new MockPlayerClass({ location: { x: 100, y: 64, z: 200 } });
            const result = paramParser.position.parser(["~"] as any, {
                player: player as any,
                param: { name: "pos", type: "position" },
                paramStrings: ["~", "~", "~"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            const info = result as ParseInfo;
            expect(info.value).toEqual({ x: 100, y: 64, z: 200 });
        });

        it("应解析混合坐标 (~5 64 ~-10)", () => {
            const player = new MockPlayerClass({ location: { x: 100, y: 64, z: 200 } });
            const result = paramParser.position.parser(["~5"] as any, {
                player: player as any,
                param: { name: "pos", type: "position" },
                paramStrings: ["~5", "64", "~-10"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            const info = result as ParseInfo;
            expect(info.value).toEqual({ x: 105, y: 64, z: 190 });
        });

        it("应解析带小数的绝对和相对坐标", () => {
            const player = new MockPlayerClass({ location: { x: 100, y: 64, z: 200 } });
            const result = paramParser.position.parser(["1.5"] as any, {
                player: player as any,
                param: { name: "pos", type: "position" },
                paramStrings: ["1.5", "~0.25", "-2.75"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toEqual({ x: 1.5, y: 64.25, z: -2.75 });
        });

        it("缺少坐标时返回 ParseError", () => {
            const result = paramParser.position.parser(["1"] as any, {
                player: new MockPlayerClass() as any,
                param: { name: "pos", type: "position" },
                paramStrings: ["1", "2"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseError);
        });

        it("格式错误时返回 ParseError", () => {
            const result = paramParser.position.parser(["abc"] as any, {
                player: new MockPlayerClass() as any,
                param: { name: "pos", type: "position" },
                paramStrings: ["abc", "def", "ghi"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseError);
        });
    });

    describe("itemType 物品类型", () => {
        it("应解析完整 ID", () => {
            const result = paramParser.itemType.parser(["minecraft:diamond"], {
                player: new MockPlayerClass() as any,
                param: { name: "item", type: "itemType" },
                paramStrings: ["minecraft:diamond"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBeTruthy();
            expect((result as ParseInfo).value).toBeInstanceOf(MockItemType);
        });

        it("应自动补全 minecraft: 前缀", () => {
            const getSpy = vi.mocked(ItemTypes.get);
            getSpy.mockClear();

            const result = paramParser.itemType.parser(["diamond"], {
                player: new MockPlayerClass() as any,
                param: { name: "item", type: "itemType" },
                paramStrings: ["diamond"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect(getSpy).toHaveBeenCalledWith("minecraft:diamond");
        });

        it("当物品不存在时返回 ParseError", () => {
            vi.mocked(ItemTypes.get).mockReturnValueOnce(undefined as any);

            const result = paramParser.itemType.parser(["minecraft:bedrock"], {
                player: new MockPlayerClass() as any,
                param: { name: "item", type: "itemType" },
                paramStrings: ["minecraft:bedrock"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseError);
        });
    });

    describe("blockType 方块类型", () => {
        it("应解析完整 ID", () => {
            const result = paramParser.blockType.parser(["minecraft:stone"], {
                player: new MockPlayerClass() as any,
                param: { name: "block", type: "blockType" },
                paramStrings: ["minecraft:stone"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBeTruthy();
        });

        it("当方块不存在时返回 ParseError", () => {
            vi.mocked(BlockTypes.get).mockReturnValueOnce(undefined as any);

            const result = paramParser.blockType.parser(["minecraft:nonexistent"], {
                player: new MockPlayerClass() as any,
                param: { name: "block", type: "blockType" },
                paramStrings: ["minecraft:nonexistent"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseError);
        });
    });

    describe("entityType 实体类型", () => {
        it("应解析实体 ID", () => {
            const result = paramParser.entityType.parser(["minecraft:creeper"], {
                player: new MockPlayerClass() as any,
                param: { name: "et", type: "entityType" },
                paramStrings: ["minecraft:creeper"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBeTruthy();
        });

        it("当实体不存在时返回 ParseError", () => {
            vi.mocked(EntityTypes.get).mockReturnValueOnce(undefined as any);

            const result = paramParser.entityType.parser(["minecraft:unknown"], {
                player: new MockPlayerClass() as any,
                param: { name: "et", type: "entityType" },
                paramStrings: ["minecraft:unknown"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseError);
        });
    });

    describe("flag 标记类型", () => {
        it("当参数名匹配时应返回参数名", () => {
            const result = paramParser.flag.parser(["facing"], {
                player: new MockPlayerClass() as any,
                param: { name: "facing", type: "flag" },
                paramStrings: ["facing"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseInfo);
            expect((result as ParseInfo).value).toBe("facing");
        });

        it("当参数名不匹配时应返回 ParseError", () => {
            const result = paramParser.flag.parser(["--other"], {
                player: new MockPlayerClass() as any,
                param: { name: "facing", type: "flag" },
                paramStrings: ["--other"],
                index: 0,
            });
            expect(result).toBeInstanceOf(ParseError);
        });
    });
});

// =====================================================
//  Part 2: CommandParser 集成测试
// =====================================================
describe("CommandParser - 集成测试", () => {
    let parser: CommandParser;
    let mockPlayer: any;
    let handlerSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        // 重新建立 ItemTypes/BlockTypes/EntityTypes 的默认实现
        // (避免上个测试的 mockReturnValue 泄漏)
        vi.mocked(ItemTypes.get).mockImplementation(((id: string) => new MockItemType(id)) as any);
        vi.mocked(BlockTypes.get).mockImplementation(((id: string) => new MockBlockType(id)) as any);
        vi.mocked(EntityTypes.get).mockImplementation(((id: string) => new MockEntityType(id)) as any);

        parser = new CommandParser();

        const mockManager = {
            testMode: false,
            commands: new Map(),
        };
        parser.init(mockManager as any);

        mockPlayer = new MockPlayerClass() as any;
        mockPlayer.sendMessage = vi.fn();
        handlerSpy = vi.fn() as any;

        vi.mocked(system.run).mockImplementation((cb: any) => {
            cb();
            return 0 as any;
        });

        vi.mocked(world.getAllPlayers).mockReturnValue([mockPlayer]);
    });

    afterEach(() => {
        LibConfig.isHost = false;
    });

    function createSimpleCmd(name: string, params: ParamObject[]) {
        return new Command(name, "测试命令", false).addParamBranches([params]).setHandler(handlerSpy);
    }

    // ─── 基本解析测试 ──────────────────────────────
    describe("基本参数解析", () => {
        it("应正确解析 int 参数", () => {
            const cmd = createSimpleCmd("test", [{ name: "count", type: "int" }]);
            parser.parseSubCommand(cmd, ["42"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { count: 42 });
        });

        it("应正确解析 float 参数", () => {
            const cmd = createSimpleCmd("test", [{ name: "value", type: "float" }]);
            parser.parseSubCommand(cmd, ["3.14"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { value: 3.14 });
        });

        it("应正确解析 boolean 参数", () => {
            const cmd = createSimpleCmd("test", [{ name: "flag", type: "boolean" }]);
            parser.parseSubCommand(cmd, ["true"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { flag: true });
        });

        it("应正确解析 string 参数", () => {
            const cmd = createSimpleCmd("test", [{ name: "msg", type: "string" }]);
            parser.parseSubCommand(cmd, ["hello"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { msg: "hello" });
        });

        it("应去除命令输入中 string 参数的外层引号", () => {
            const cmd = createSimpleCmd("test", [{ name: "msg", type: "string" }]);
            parser.parseSubCommand(cmd, ['"hello world"'], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { msg: "hello world" });
        });

        it("应正确解析 enum 参数", () => {
            const cmd = createSimpleCmd("test", [
                { name: "dir", type: "enum", enums: ["up", "down"] },
            ]);
            parser.parseSubCommand(cmd, ["up"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { dir: "up" });
        });

        it("应正确解析 target 参数 (@s)", () => {
            const cmd = createSimpleCmd("test", [{ name: "who", type: "target" }]);
            parser.parseSubCommand(cmd, ['"s"'], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { who: mockPlayer });
        });

        it("应正确解析多个连续参数", () => {
            const cmd = createSimpleCmd("test", [
                { name: "count", type: "int" },
                { name: "name", type: "string" },
                { name: "enabled", type: "boolean" },
            ]);
            parser.parseSubCommand(cmd, ["42", "hello", "true"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, {
                count: 42,
                name: "hello",
                enabled: true,
            });
        });
    });

    it("未知命令应发送 RawMessage，而不是导致 ScriptAPI 类型转换异常", () => {
        LibConfig.isHost = true;
        parser.parseCommand("missing", mockPlayer);
        expect(mockPlayer.sendMessage).toHaveBeenCalledWith({
            rawtext: [
                { text: "§c" },
                { translate: "commands.generic.unknown", with: ["missing"] },
            ],
        });
    });

    // ─── 可选参数 ───────────────────────────────────
    describe("可选参数 (optional)", () => {
        it("应正常解析带可选参数的完整输入", () => {
            const cmd = createSimpleCmd("test", [
                { name: "required", type: "string" },
                { name: "optional", type: "int", optional: true },
            ]);
            parser.parseSubCommand(cmd, ["hello", "42"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, {
                required: "hello",
                optional: 42,
            });
        });

        it("省略可选参数时能成功", () => {
            const cmd = createSimpleCmd("test", [
                { name: "required", type: "string" },
                { name: "optional", type: "int", optional: true },
            ]);
            parser.parseSubCommand(cmd, ["hello"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { required: "hello" });
        });

        it("可选参数使用默认值", () => {
            const cmd = createSimpleCmd("test", [
                { name: "msg", type: "string" },
                { name: "count", type: "int", optional: true, default: 99 },
            ]);
            parser.parseSubCommand(cmd, ["hello"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, {
                msg: "hello",
                count: 99,
            });
        });

        it("多个可选参数都可以省略", () => {
            const cmd = createSimpleCmd("test", [
                { name: "a", type: "int" },
                { name: "b", type: "int", optional: true },
                { name: "c", type: "int", optional: true },
            ]);
            parser.parseSubCommand(cmd, ["1"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { a: 1 });
        });

        it("中间的可选参数如果匹配则会正常解析", () => {
            // 注意: 解析器是贪心顺序匹配的, 中间的可选参数如果有值会先被消耗
            // 因此 ["1", "3"] 会匹配 a=1, b=3 (c 缺失报错)
            const cmd = createSimpleCmd("test", [
                { name: "a", type: "int" },
                { name: "b", type: "int", optional: true },
                { name: "c", type: "int" },
            ]);
            parser.parseSubCommand(cmd, ["1", "2", "3"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { a: 1, b: 2, c: 3 });
        });
    });

    // ─── 参数验证器 (ParamValidator) ────────────────
    describe("参数验证器 (ParamValidator)", () => {
        it("验证通过时应正常解析", () => {
            const validator = vi.fn((value: number) => {
                if (value < 0) return "不能为负数";
            });
            const cmd = createSimpleCmd("test", [{ name: "count", type: "int", validator }]);
            parser.parseSubCommand(cmd, ["42"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { count: 42 });
            expect(validator).toHaveBeenCalledWith(42, mockPlayer);
        });

        it("验证失败时应报错", () => {
            const validator = vi.fn((value: number) => {
                if (value < 0) return "不能为负数";
            });
            const cmd = createSimpleCmd("test", [{ name: "count", type: "int", validator }]);
            parser.parseSubCommand(cmd, ["-5"], mockPlayer);
            expect(handlerSpy).not.toHaveBeenCalled();
            expect(mockPlayer.sendMessage).toHaveBeenCalled();
        });

        it("验证器返回 ParseError 也应处理", () => {
            const validator = vi.fn(() => new ParseError("自定义错误", true));
            const cmd = createSimpleCmd("test", [{ name: "x", type: "int", validator }]);
            parser.parseSubCommand(cmd, ["42"], mockPlayer);
            expect(handlerSpy).not.toHaveBeenCalled();
        });

        it("ItemType 验证器 - 禁止基岩", () => {
            const validator = vi.fn((value: ItemType) => {
                if (value.id === "minecraft:bedrock") return "禁止基岩";
            });
            const cmd = createSimpleCmd("test", [{ name: "item", type: "itemType", validator }]);

            // 验证通过
            parser.parseSubCommand(cmd, ["minecraft:diamond"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalled();

            // 验证失败
            vi.mocked(ItemTypes.get).mockReturnValue(new MockItemType("minecraft:bedrock") as any);
            handlerSpy.mockClear();
            mockPlayer.sendMessage.mockClear();
            parser.parseSubCommand(cmd, ["minecraft:bedrock"], mockPlayer);
            expect(handlerSpy).not.toHaveBeenCalled();
            // 检查 sendMessage 是否被调用且消息包含 "禁止基岩"
            const lastCall = mockPlayer.sendMessage.mock.calls[0][0];
            expect(JSON.stringify(lastCall)).toContain("禁止基岩");
        });
    });

    // ─── 命令验证器 (CommandValidator) ──────────────
    describe("命令验证器 (CommandValidator)", () => {
        it("验证通过时应执行 handler", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "x", type: "int" }]])
                .setHandler(handlerSpy)
                .setValidator((p: any) => {
                    if (p.getGameMode() !== GameMode.Creative) return "只能在创造使用";
                });
            parser.parseSubCommand(cmd, ["42"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { x: 42 });
        });

        it("验证失败时应阻止执行", () => {
            mockPlayer.getGameMode.mockReturnValue(GameMode.Survival);
            const cmd = new Command("test", "测试", false)
                .addParamBranches([[{ name: "x", type: "int" }]])
                .setHandler(handlerSpy)
                .setValidator((p: any) => {
                    if (p.getGameMode() !== GameMode.Creative) return "只能在创造使用";
                });
            parser.parseSubCommand(cmd, ["42"], mockPlayer);
            expect(handlerSpy).not.toHaveBeenCalled();
            expect(mockPlayer.sendMessage).toHaveBeenCalled();
        });
    });

    // ─── 错误情况 ───────────────────────────────────
    describe("错误处理", () => {
        it("缺少必填参数应报错", () => {
            const cmd = createSimpleCmd("test", [{ name: "required", type: "int" }]);
            parser.parseSubCommand(cmd, [], mockPlayer);
            expect(handlerSpy).not.toHaveBeenCalled();
            expect(mockPlayer.sendMessage).toHaveBeenCalled();
        });

        it("无效的枚举值应报错", () => {
            const cmd = createSimpleCmd("test", [
                { name: "dir", type: "enum", enums: ["up", "down"] },
            ]);
            parser.parseSubCommand(cmd, ["sideways"], mockPlayer);
            expect(handlerSpy).not.toHaveBeenCalled();
            expect(mockPlayer.sendMessage).toHaveBeenCalled();
        });

        it("多余参数应报错", () => {
            const cmd = createSimpleCmd("test", [{ name: "a", type: "int" }]);
            parser.parseSubCommand(cmd, ["1", "2", "3"], mockPlayer);
            expect(handlerSpy).not.toHaveBeenCalled();
            expect(mockPlayer.sendMessage).toHaveBeenCalled();
        });

        it("没有 handler 但传了参数应报错", () => {
            const cmd = new Command("test", "测试", false).addParamBranches([
                [{ name: "x", type: "int" }],
            ]);
            parser.parseSubCommand(cmd, ["42"], mockPlayer);
            expect(mockPlayer.sendMessage).toHaveBeenCalled();
        });

        it("int 参数收到非数字时解析失败", () => {
            const cmd = createSimpleCmd("test", [{ name: "count", type: "int" }]);
            // "abc" 会被 int regex 拦截
            parser.parseSubCommand(cmd, ["abc"], mockPlayer);
            expect(handlerSpy).not.toHaveBeenCalled();
        });
    });

    // ─── 参数分支 (多分支) ──────────────────────────
    describe("参数分支 (多 paramBranches)", () => {
        it("应匹配第一个可行的分支 (enum)", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([
                    [{ name: "mode", type: "enum", enums: ["up", "down"] }],
                    [{ name: "count", type: "int" }],
                ])
                .setHandler(handlerSpy);

            parser.parseSubCommand(cmd, ["up"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { mode: "up" });
        });

        it("当第一个分支不匹配时应尝试第二个分支", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([
                    [{ name: "mode", type: "enum", enums: ["up", "down"] }],
                    [{ name: "count", type: "int" }],
                ])
                .setHandler(handlerSpy);

            handlerSpy.mockClear();
            parser.parseSubCommand(cmd, ["42"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { count: 42 });
        });

        it("所有分支都不匹配时应报错", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([
                    [{ name: "mode", type: "enum", enums: ["up", "down"] }],
                    [{ name: "count", type: "int" }],
                ])
                .setHandler(handlerSpy);

            handlerSpy.mockClear();
            parser.parseSubCommand(cmd, ["abc"], mockPlayer);
            expect(handlerSpy).not.toHaveBeenCalled();
            expect(mockPlayer.sendMessage).toHaveBeenCalled();
        });

        it("多分支中只有一个匹配时应正确选择", () => {
            const cmd = new Command("test", "测试", false)
                .addParamBranches([
                    [{ name: "mode", type: "enum", enums: ["a", "b"] }, { name: "val", type: "int" }],
                    [{ name: "val", type: "int" }],
                ])
                .setHandler(handlerSpy);

            // 尝试匹配 "a" 42 → 应匹配分支1
            parser.parseSubCommand(cmd, ["a", "42"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { mode: "a", val: 42 });

            // 尝试匹配 99 → 应匹配分支2
            handlerSpy.mockClear();
            parser.parseSubCommand(cmd, ["99"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { val: 99 });
        });
    });

    // ─── 复杂分支 (类似 tp 命令) ────────────────────
    describe("复杂分支结构 (类似 tp)", () => {
        it("应支持带 branches 的嵌套结构", () => {
            const cmd = Command.fromObject({
                name: "tp",
                explain: "传送测试",
                isAdmin: true,
                handler: handlerSpy,
                paramBranches: [
                    [{ name: "destination", type: "target" }],
                    [
                        { name: "victim", type: "target" },
                        { name: "destination", type: "target" },
                    ],
                    [
                        { name: "victim", type: "target" },
                        { name: "destination", type: "position" },
                        { name: "checkForBlocks", type: "boolean", optional: true },
                    ],
                ],
            });

            // 分支1: 只传 destination
            parser.parseSubCommand(cmd, ['"s"'], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { destination: mockPlayer });

            // 分支2: victim + destination(target)
            const bob = new MockPlayerClass({ name: "Bob", id: "bob-uuid" }) as any;
            vi.mocked(world.getAllPlayers).mockReturnValue([mockPlayer, bob]);
            handlerSpy.mockClear();

            parser.parseSubCommand(cmd, ["Bob", '"s"'], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, {
                victim: bob,
                destination: mockPlayer,
            });

            // 分支3: victim + destination(position)
            handlerSpy.mockClear();
            parser.parseSubCommand(cmd, ["Bob", "10", "20", "30"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, {
                victim: bob,
                destination: { x: 10, y: 20, z: 30 },
            });

            // 分支3: victim + destination(position) + checkForBlocks
            handlerSpy.mockClear();
            parser.parseSubCommand(cmd, ["Bob", "10", "20", "30", "true"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, {
                victim: bob,
                destination: { x: 10, y: 20, z: 30 },
                checkForBlocks: true,
            });
        });
    });

    // ─── 用户示例: native 命令测试 ──────────────────
    describe("示例命令: native 命令", () => {
        it("应正确解析完整的 native 命令参数", () => {
            const cmd = new Command("native", "native命令测试", false)
                .addParamBranches([
                    [
                        { name: "type", type: "enum", enums: ["up", "down"] },
                        { name: "player", type: "target" },
                        { name: "item", type: "itemType", optional: true },
                        { name: "pos", type: "position", optional: true },
                        { name: "block", type: "blockType", optional: true },
                        { name: "entitytype", type: "entityType", optional: true },
                    ],
                ])
                .setHandler(handlerSpy);

            // 解析: type + player (必填) + item (可选)
            parser.parseSubCommand(cmd, ["up", '"s"', "minecraft:diamond"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalled();
            const args = handlerSpy.mock.calls[0][1];
            expect(args.type).toBe("up");
            expect(args.player).toBe(mockPlayer);
            expect(args.item).toBeInstanceOf(MockItemType);
        });

        it("应拒绝无效的枚举值", () => {
            const cmd = new Command("native", "native命令测试", false)
                .addParamBranches([
                    [
                        { name: "type", type: "enum", enums: ["up", "down"] },
                        { name: "player", type: "target" },
                    ],
                ])
                .setHandler(handlerSpy);

            parser.parseSubCommand(cmd, ["sideways", '"s"'], mockPlayer);
            expect(handlerSpy).not.toHaveBeenCalled();
        });

        it("应拒绝玩家名不存在", () => {
            const cmd = new Command("native", "native命令测试", false)
                .addParamBranches([
                    [
                        { name: "type", type: "enum", enums: ["up", "down"] },
                        { name: "player", type: "target" },
                    ],
                ])
                .setHandler(handlerSpy);

            vi.mocked(world.getAllPlayers).mockReturnValue([]);
            parser.parseSubCommand(cmd, ["up", "NonExistent"], mockPlayer);
            expect(handlerSpy).not.toHaveBeenCalled();
        });

        it("ItemType 验证器应生效", () => {
            const itemValidator = vi.fn((value: any) => {
                if (value.id === "minecraft:bedrock") return "禁止基岩";
            });
            const cmd = new Command("native", "native命令测试", false)
                .addParamBranches([
                    [
                        { name: "type", type: "enum", enums: ["up", "down"] },
                        { name: "player", type: "target" },
                        {
                            name: "item",
                            type: "itemType",
                            optional: true,
                            validator: itemValidator,
                        },
                    ],
                ])
                .setHandler(handlerSpy);

            // 允许非基岩的物品
            parser.parseSubCommand(cmd, ["up", '"s"', "minecraft:diamond"], mockPlayer);
            expect(handlerSpy).toHaveBeenCalled();

            // 禁止基岩
            vi.mocked(ItemTypes.get).mockReturnValue(new MockItemType("minecraft:bedrock") as any);
            handlerSpy.mockClear();
            mockPlayer.sendMessage.mockClear();

            parser.parseSubCommand(cmd, ["up", '"s"', "minecraft:bedrock"], mockPlayer);
            expect(handlerSpy).not.toHaveBeenCalled();
            expect(mockPlayer.sendMessage).toHaveBeenCalled();
        });

        it("应正确解析带所有可选参数的命令", () => {
            const cmd = new Command("native", "native命令测试", false)
                .addParamBranches([
                    [
                        { name: "type", type: "enum", enums: ["up", "down"] },
                        { name: "player", type: "target" },
                        { name: "item", type: "itemType", optional: true },
                        { name: "pos", type: "position", optional: true },
                        { name: "block", type: "blockType", optional: true },
                        { name: "entitytype", type: "entityType", optional: true },
                    ],
                ])
                .setHandler(handlerSpy);

            // 全部传上
            parser.parseSubCommand(
                cmd,
                ["up", '"s"', "minecraft:diamond", "100", "64", "200", "minecraft:stone", "minecraft:creeper"],
                mockPlayer
            );
            expect(handlerSpy).toHaveBeenCalled();
            const args = handlerSpy.mock.calls[0][1];
            expect(args.type).toBe("up");
            expect(args.player).toBe(mockPlayer);
            expect(args.item).toBeInstanceOf(MockItemType);
            expect(args.pos).toEqual({ x: 100, y: 64, z: 200 });
            expect(args.block).toBeInstanceOf(MockBlockType);
            expect(args.entitytype).toBeInstanceOf(MockEntityType);
        });
    });

    // ─── testMode 测试 ──────────────────────────────
    describe("testMode", () => {
        it("testMode 下不应调用 sendMessage 和 handler", () => {
            const mockManager = { testMode: true, commands: new Map() };
            const testParser = new CommandParser();
            testParser.init(mockManager as any);

            const cmd = createSimpleCmd("test", [{ name: "x", type: "int" }]);
            expect(() => {
                testParser.parseSubCommand(cmd, ["42"], mockPlayer);
            }).not.toThrow();
            expect(handlerSpy).not.toHaveBeenCalled();
            expect(mockPlayer.sendMessage).not.toHaveBeenCalled();
        });
    });
});

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
        vi.mocked(BlockTypes.get).mockImplementation(((id: string) => new MockBlockType(id)) as any);
        vi.mocked(EntityTypes.get).mockImplementation(((id: string) => new MockEntityType(id)) as any);

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

// =====================================================
//  Part 4: 边缘案例测试
// =====================================================
describe("边缘案例", () => {
    let parser: CommandParser;
    let mockPlayer: any;
    let handlerSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(ItemTypes.get).mockImplementation(((id: string) => new MockItemType(id)) as any);
        vi.mocked(BlockTypes.get).mockImplementation(((id: string) => new MockBlockType(id)) as any);
        vi.mocked(EntityTypes.get).mockImplementation(((id: string) => new MockEntityType(id)) as any);

        parser = new CommandParser();
        parser.init({ testMode: false, commands: new Map() } as any);
        mockPlayer = new MockPlayerClass() as any;
        mockPlayer.sendMessage = vi.fn();
        handlerSpy = vi.fn() as any;
        vi.mocked(system.run).mockImplementation(((cb: any) => {
            cb();
            return 0 as any;
        }) as any);
    });

    it("Command.fromObject 不应改写调用方的参数定义", () => {
        const definition: any = {
            name: "immutable",
            explain: "测试",
            paramBranches: [
                {
                    name: "facing",
                    type: "flag",
                    branches: [[{ name: "pos", type: "position" }]],
                },
            ],
        };

        Command.fromObject(definition);

        expect(definition.paramBranches[0].branches).toEqual([
            [{ name: "pos", type: "position" }],
        ]);
        expect(definition.paramBranches[0].subParams).toBeUndefined();
    });

    it("无参数命令应正确工作", () => {
        const cmd = new Command("test", "测试", false, handlerSpy);
        parser.parseSubCommand(cmd, [], mockPlayer);
        expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, {});
    });

    it("无参数命令带多余参数应报错", () => {
        const cmd = new Command("test", "测试", false, handlerSpy);
        parser.parseSubCommand(cmd, ["extra"], mockPlayer);
        expect(handlerSpy).not.toHaveBeenCalled();
        expect(mockPlayer.sendMessage).toHaveBeenCalled();
    });

    it("多个同类型 enum 分支应能正确解析", () => {
        const cmd = new Command("test", "测试", false)
            .addParamBranches([
                [{ name: "a", type: "enum", enums: ["x", "y"] }],
                [{ name: "b", type: "enum", enums: ["z", "w"] }],
            ])
            .setHandler(handlerSpy);

        parser.parseSubCommand(cmd, ["x"], mockPlayer);
        expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { a: "x" });

        handlerSpy.mockClear();
        parser.parseSubCommand(cmd, ["z"], mockPlayer);
        expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, { b: "z" });
    });

    it("position 参数应正确消耗多个 token", () => {
        const cmd = new Command("test", "测试", false)
            .addParamBranches([
                [
                    { name: "target", type: "target" },
                    { name: "pos", type: "position" },
                    { name: "extra", type: "boolean", optional: true },
                ],
            ])
            .setHandler(handlerSpy);

        // pos 消耗 3 个 token (x y z)，后面没有 extra
        parser.parseSubCommand(cmd, ['"s"', "10", "20", "30"], mockPlayer);
        expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, {
            target: mockPlayer,
            pos: { x: 10, y: 20, z: 30 },
        });

        // pos 消耗 3 个 token，后面有 extra
        handlerSpy.mockClear();
        parser.parseSubCommand(cmd, ['"s"', "10", "20", "30", "true"], mockPlayer);
        expect(handlerSpy).toHaveBeenCalledWith(mockPlayer, {
            target: mockPlayer,
            pos: { x: 10, y: 20, z: 30 },
            extra: true,
        });
    });

    it("showError=false 时应返回错误消息而非发送", () => {
        const result = (parser as any).dispatchError(mockPlayer, false, "测试错误");
        expect(result).toBeTruthy();
        expect(result.rawtext[0].text).toBe("§c");
    });

    it("从 Command.fromObject 创建的标志参数 (flag) 应能解析", () => {
        // 模拟带 flag 的简化结构
        const cmd = Command.fromObject({
            name: "testflag",
            explain: "flag 测试",
            handler: handlerSpy,
            paramBranches: [
                [
                    { name: "x", type: "int" },
                    {
                        name: "facing",
                        type: "flag",
                        branches: [
                            [
                                {
                                    name: "lookAtPosition",
                                    type: "position",
                                },
                            ],
                            [
                                {
                                    name: "lookAtEntity",
                                    type: "target",
                                },
                            ],
                        ],
                    },
                ],
            ],
        });

        // 解析: 先 int, 再 flag "facing", 再 position
        parser.parseSubCommand(cmd, ["42", "facing", "10", "20", "30"], mockPlayer);
        expect(handlerSpy).toHaveBeenCalled();

        const args = handlerSpy.mock.calls[0][1];
        expect(args.x).toBe(42);
        expect(args.facing).toBe("facing");
        expect(args.lookAtPosition).toEqual({ x: 10, y: 20, z: 30 });
    });

    it("flag 分支 - 选择 target 分支", () => {
        const cmd = Command.fromObject({
            name: "testflag2",
            explain: "flag 测试2",
            handler: handlerSpy,
            paramBranches: [
                [
                    { name: "x", type: "int" },
                    {
                        name: "facing",
                        type: "flag",
                        branches: [
                            [{ name: "lookAtPosition", type: "position" }],
                            [{ name: "lookAtEntity", type: "target" }],
                        ],
                    },
                ],
            ],
        });

        handlerSpy.mockClear();
        parser.parseSubCommand(cmd, ["42", "facing", '"s"'], mockPlayer);
        expect(handlerSpy).toHaveBeenCalled();

        const args = handlerSpy.mock.calls[0][1];
        expect(args.x).toBe(42);
        expect(args.lookAtEntity).toBe(mockPlayer);
    });
});
