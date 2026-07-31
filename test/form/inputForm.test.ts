// =====================================================
// InputForm - label/divider 槽位对齐与解析测试
// =====================================================
import { describe, it, expect, vi } from "vitest";

// ─── Mock @minecraft/server-ui ────────────────────────
vi.mock("@minecraft/server-ui", () => {
    class MockModalFormData {
        title = vi.fn(() => this);
        submitButton = vi.fn(() => this);
        textField = vi.fn(() => this);
        toggle = vi.fn(() => this);
        dropdown = vi.fn(() => this);
        slider = vi.fn(() => this);
        label = vi.fn(() => this);
        divider = vi.fn(() => this);
        show = vi.fn();
    }
    return {
        ModalFormData: MockModalFormData,
        ModalFormResponse: class {},
        ActionFormData: class {},
        MessageFormData: class {},
        FormRejectError: class extends Error {},
    };
});

// ─── Mock @minecraft/server（InputForm 中仅类型使用，防御性 mock）─
vi.mock("@minecraft/server", () => ({
    Player: class {
        sendMessage = vi.fn();
    },
    RawMessage: Object,
    PlayerPermissionLevel: { Operator: "operator", Member: "member" },
    system: { run: vi.fn(), runTimeout: vi.fn() },
}));

// ─── Mock Translate：defineLangTree 保留树形，translator 模拟按 zh_CN 翻译 ─
vi.mock("../../src/Translate", () => ({
    defineLangTree: (tree: Record<string, unknown>) => tree,
    translator: {
        createPureFor: vi.fn(() => (text: any, params?: Record<string, unknown>) => {
            if (typeof text === "string") return text;
            const zh = text?.zh_CN ?? "translated";
            // 模拟 {index} 之类占位符替换，便于断言提示文本
            return params ? zh.replace(/\{(\w+)\}/g, (_: string, k: string) => String(params[k])) : zh;
        }),
        createUniversal: vi.fn(() => (text: any) => {
            if (typeof text === "string") return text;
            return text?.zh_CN ?? "translated";
        }),
    },
}));

// ─── Imports (after mocks) ───────────────────────────
import { InputForm } from "../../src/Form/commonForm/InputForm";
import {
    BaseField,
    TextField,
    ToggleField,
    LabelField,
    DividerField,
} from "../../src/Form/commonForm/InputFormFields";

/** 构造一个最小化的 formContext mock */
function createContext(fields: BaseField[]) {
    const player = { sendMessage: vi.fn() } as any;
    const reopen = vi.fn();
    const ctx = { args: { fields }, player, reopen } as any;
    return { ctx, player, reopen };
}

/** 构造一个非取消的 ModalFormResponse mock */
function createResponse(formValues: unknown[]) {
    return { canceled: false, formValues } as any;
}

describe("InputForm - label/divider 槽位对齐", () => {
    it("builder 保留全部字段（含 label/divider），与 formValues 槽位对齐", () => {
        const fields = [new LabelField("标题"), new TextField("名字", "请输入").key("name")];
        const genFields = [new DividerField(), new ToggleField("启用").key("enabled")];
        const form = new InputForm({ fields, fieldsGenerator: () => genFields } as any);

        const args: Record<string, unknown> = {};
        form.builder({} as any, args as any);

        expect(args.fields).toEqual([...fields, ...genFields]);
        expect(args.fields).toHaveLength(4);
    });

    it("label/divider 占据 formValues 槽位（值为 undefined）时正常解析并提交", async () => {
        const fields = [
            new LabelField("标题"),
            new TextField("名字", "请输入").key("name"),
            new DividerField(),
            new ToggleField("启用").key("enabled"),
        ];
        const { ctx, player, reopen } = createContext(fields);
        const onSubmit = vi.fn();
        const form = new InputForm({ onSubmit } as any);

        // 1.21+ 中 label/divider 占用槽位，值为 undefined
        const res = createResponse([undefined, "Alice", undefined, true]);
        await form.handler(res, ctx);

        // 长度校验通过：label/divider 与 undefined 槽位一一对应
        expect(reopen).not.toHaveBeenCalled();
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith({ name: "Alice", enabled: true }, ctx);
        expect(player.sendMessage).not.toHaveBeenCalled();
    });

    it("无 label/divider 的普通表单不受影响", async () => {
        const fields = [
            new TextField("名字", "请输入").key("name"),
            new ToggleField("启用").key("enabled"),
        ];
        const { ctx, reopen } = createContext(fields);
        const onSubmit = vi.fn();
        const form = new InputForm({ onSubmit } as any);

        await form.handler(createResponse(["Bob", false]), ctx);

        expect(reopen).not.toHaveBeenCalled();
        expect(onSubmit).toHaveBeenCalledWith({ name: "Bob", enabled: false }, ctx);
    });

    it("字段校验失败时按槽位定位并重新打开表单", async () => {
        const fields = [
            new LabelField("标题"),
            new TextField("名字", "请输入").key("name"), // 必填
            new ToggleField("启用").key("enabled"),
        ];
        const { ctx, player, reopen } = createContext(fields);
        const onSubmit = vi.fn();
        const form = new InputForm({ onSubmit } as any);

        // name 为空字符串 → 必填校验失败；label 占位使 name 位于第 2 个槽位
        await form.handler(createResponse([undefined, "", false]), ctx);

        expect(onSubmit).not.toHaveBeenCalled();
        expect(reopen).toHaveBeenCalledTimes(1);
        expect(player.sendMessage).toHaveBeenCalledWith(
            "§c第 2 个输入项验证失败: 该项为必填项，不能为空"
        );
    });

    it("formValues 与字段数不一致时提示长度不匹配并重新打开", async () => {
        const fields = [new TextField("名字", "请输入").key("name")];
        const { ctx, player, reopen } = createContext(fields);
        const onSubmit = vi.fn();
        const form = new InputForm({ onSubmit } as any);

        // 值比字段多（例如未对齐的槽位），应被长度校验拦截
        await form.handler(createResponse(["A", "B"]), ctx);

        expect(onSubmit).not.toHaveBeenCalled();
        expect(reopen).toHaveBeenCalledTimes(1);
        expect(player.sendMessage).toHaveBeenCalledWith(
            "§c表单处理异常：提交的数据量与预期不符"
        );
    });

    it("表单被取消时调用 onCancel 且不触发提交", async () => {
        const fields = [new TextField("名字", "请输入").key("name")];
        const { ctx } = createContext(fields);
        const onSubmit = vi.fn();
        const onCancel = vi.fn();
        const form = new InputForm({ onSubmit, onCancel } as any);

        await form.handler({ canceled: true, formValues: ["x"] } as any, ctx);

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onSubmit).not.toHaveBeenCalled();
    });
});
