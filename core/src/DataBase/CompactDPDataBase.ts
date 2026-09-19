import { world } from "@minecraft/server";
import { Logger } from "../utils/logger";
import { DataBase, DPDataBase, type DPSource } from "./DataBase";

export type CompactFieldKind = "string" | "int" | "number" | "boolean";

export type CompactValueForKind<TKind extends CompactFieldKind> =
    TKind extends "string" ? string :
    TKind extends "boolean" ? boolean :
    number;

type CompactFieldForKind<TKind extends CompactFieldKind> =
    | readonly [name: string, kind: TKind]
    | readonly [
          name: string,
          kind: TKind,
          options: Readonly<{ default: CompactValueForKind<TKind> }>,
      ];

export type CompactFieldDefinition = {
    [TKind in CompactFieldKind]: CompactFieldForKind<TKind>;
}[CompactFieldKind];

export type CompactStructValue<TFields extends readonly CompactFieldDefinition[]> = {
    [TField in TFields[number] as TField[0]]: CompactValueForKind<TField[1]>;
};

export type CompactDecodeErrorCode =
    | "invalid_input"
    | "invalid_json"
    | "invalid_shape"
    | "schema_mismatch"
    | "invalid_value"
    | "missing_field"
    | "storage_corrupt";

export interface CompactDecodeError {
    code: CompactDecodeErrorCode;
    message: string;
    field?: string;
    fieldIndex?: number;
}

export type CompactDecodeResult<T> =
    | { ok: true; value: T }
    | { ok: false; error: CompactDecodeError };

export type CompactReadResult<T> =
    | { status: "ok"; value: T }
    | { status: "missing" }
    | { status: "invalid"; error: CompactDecodeError };

export class CompactEncodeError extends TypeError {
    constructor(
        message: string,
        public readonly field?: string,
    ) {
        super(message);
        this.name = CompactEncodeError.name;
    }
}

/**
 * 按 schema 中的字段顺序，把对象编码为不含字段名的紧凑 JSON 数组。
 *
 * 例如 schema [name, money, enabled]：
 *   { name: "A", money: 10000, enabled: true }
 * -> ["A",10000,1]
 *
 * JSON 自身负责字符串转义与边界处理，不需要维护自定义分隔符或长度协议。
 */
export class CompactStructCodec<
    const TFields extends readonly CompactFieldDefinition[],
> {
    public readonly fields: TFields;
    private readonly fieldNames: ReadonlySet<string>;

    constructor(fields: TFields) {
        validateSchema(fields);
        this.fields = Object.freeze(
            fields.map((field) => {
                if (field.length === 3) {
                    return Object.freeze([
                        field[0],
                        field[1],
                        Object.freeze({ ...field[2] }),
                    ]);
                }
                return Object.freeze([field[0], field[1]]);
            }),
        ) as unknown as TFields;
        this.fieldNames = new Set(this.fields.map(([name]) => name));
    }

    encode(value: CompactStructValue<TFields>): string {
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
            throw new CompactEncodeError("紧凑结构数据必须是对象");
        }

        const record = value as Record<string, unknown>;
        const keys = Reflect.ownKeys(record);
        if (
            keys.length !== this.fields.length ||
            keys.some((key) => typeof key !== "string" || !this.fieldNames.has(key)) ||
            this.fields.some(([name]) => !Object.prototype.hasOwnProperty.call(record, name))
        ) {
            throw new CompactEncodeError("数据字段必须与 schema 完全一致，不能缺少或增加字段");
        }

        const storedValues = this.fields.map(([name, kind]) =>
            encodeStoredValue(kind, record[name], name),
        );
        return JSON.stringify(storedValues);
    }

    decode(input: unknown): CompactDecodeResult<CompactStructValue<TFields>> {
        if (typeof input !== "string") {
            return decodeError("invalid_input", "紧凑结构存储值必须是字符串");
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(input);
        } catch {
            return decodeError("invalid_json", "紧凑结构数据不是合法 JSON");
        }

        if (!Array.isArray(parsed)) {
            return decodeError("invalid_shape", "紧凑结构数据必须是 JSON 数组");
        }
        if (parsed.length === 0) {
            return decodeError("invalid_shape", "紧凑结构记录至少应包含一个字段");
        }

        if (parsed.length > this.fields.length) {
            return decodeError(
                "schema_mismatch",
                `存储记录包含 ${parsed.length} 个字段，但当前 schema 只有 ${this.fields.length} 个字段`,
            );
        }

        const entries: [string, string | number | boolean][] = [];

        for (let fieldIndex = 0; fieldIndex < parsed.length; fieldIndex++) {
            const [name, kind] = this.fields[fieldIndex];
            const decoded = decodeStoredValue(kind, parsed[fieldIndex]);

            if (!decoded.ok) {
                return decodeError(
                    "invalid_value",
                    `字段 ${name} 的 ${kind} 值格式无效`,
                    name,
                    fieldIndex,
                );
            }

            entries.push([name, decoded.value]);
        }

        for (let fieldIndex = parsed.length; fieldIndex < this.fields.length; fieldIndex++) {
            const field = this.fields[fieldIndex];
            const defaultResult = getFieldDefault(field);

            if (!defaultResult.hasDefault) {
                return decodeError(
                    "missing_field",
                    `旧记录缺少当前 schema 的字段 ${field[0]}，且该字段没有 default`,
                    field[0],
                    fieldIndex,
                );
            }

            entries.push([field[0], defaultResult.value]);
        }

        return {
            ok: true,
            value: Object.fromEntries(entries) as CompactStructValue<TFields>,
        };
    }
}

/**
 * 只允许读写固定 schema 的结构化数据，并使用 Dynamic Property 持久化。
 *
 * schema 数组顺序就是持久化协议中的字段位置。已投入使用后：
 * - 不得重排、删除或改变已有字段类型/语义；
 * - 兼容旧记录的新字段只能追加到末尾，并提供 default。
 *
 * 新记录始终写入完整 schema；default 只用于读取字段数更少的旧记录。
 */
export class CompactDPDataBase<
    const TFields extends readonly CompactFieldDefinition[],
> extends DataBase<CompactStructValue<TFields>> {
    public readonly codec: CompactStructCodec<TFields>;
    private readonly storage: DPDataBase;
    private readonly logger: Logger;

    constructor(name: string, fields: TFields, source: DPSource = world) {
        const codec = new CompactStructCodec(fields);
        // CompactDPDataBase 仍然是 DP 后端，不扩展公开 DBTypes 联合，避免破坏现有 exhaustive mapping。
        super(name, "DP", source === world);

        this.codec = codec;
        this.storage = new DPDataBase(name, source);
        this.logger = new Logger(`${CompactDPDataBase.name}_${name}`);

        // world-backed 的内部 DPDataBase 会先占用同名全局注册项；
        // 对外暴露结构化 facade，避免通过全局表绕过 schema 写原始值。
        if (source === world) DataBase.DBMap[name] = this;
    }

    set(key: string, value: CompactStructValue<TFields>): void {
        this.storage.set(key, this.codec.encode(value));
    }

    async setAsync(key: string, value: CompactStructValue<TFields>): Promise<void> {
        await this.storage.setAsync(key, this.codec.encode(value));
    }

    get(key: string): CompactStructValue<TFields> | undefined {
        const result = this.read(key);
        if (result.status === "ok") return result.value;
        if (result.status === "invalid") {
            this.logger.warn(
                `读取紧凑结构数据失败,key:${key},code:${result.error.code},field:${result.error.field ?? "-"}`,
            );
        }
        return undefined;
    }

    /**
     * 区分“键不存在”和“已有数据损坏/格式不匹配”。
     * 不会自动删除、覆盖或迁移损坏的数据。
     */
    read(key: string): CompactReadResult<CompactStructValue<TFields>> {
        const raw = this.storage.get(key);
        if (raw === undefined) {
            if (this.storage.has(key)) {
                return {
                    status: "invalid",
                    error: {
                        code: "storage_corrupt",
                        message: "底层 DP 记录存在，但分片缺失或类型损坏，无法还原字符串",
                    },
                };
            }
            return { status: "missing" };
        }

        const decoded = this.codec.decode(raw);
        if (!decoded.ok) return { status: "invalid", error: decoded.error };
        return { status: "ok", value: decoded.value };
    }

    rm(key: string): void {
        this.storage.rm(key);
    }

    keys(): string[] {
        return this.storage.keys();
    }

    clear(): void {
        this.storage.clear();
    }
}

function validateSchema(fields: readonly CompactFieldDefinition[]): void {
    if (!Array.isArray(fields) || fields.length === 0) {
        throw new TypeError("紧凑结构 schema 至少需要一个字段");
    }

    const names = new Set<string>();
    let defaultSuffixStarted = false;

    fields.forEach((field, fieldIndex) => {
        if (!Array.isArray(field) || (field.length !== 2 && field.length !== 3)) {
            throw new TypeError(
                `schema 第 ${fieldIndex} 个字段必须是 [name, kind] 或 [name, kind, { default }]`,
            );
        }

        const [name, kind] = field;
        if (typeof name !== "string" || name.length === 0) {
            throw new TypeError(`schema 第 ${fieldIndex} 个字段名不能为空`);
        }
        if (names.has(name)) {
            throw new TypeError(`schema 字段名重复: ${name}`);
        }
        names.add(name);

        if (!isFieldKind(kind)) {
            throw new TypeError(`schema 字段 ${name} 的类型无效`);
        }

        if (field.length === 3) {
            const options = field[2] as Record<string, unknown> | null;
            if (
                typeof options !== "object" ||
                options === null ||
                Array.isArray(options) ||
                Reflect.ownKeys(options).length !== 1 ||
                !Object.prototype.hasOwnProperty.call(options, "default")
            ) {
                throw new TypeError(`schema 字段 ${name} 的选项只能包含 default`);
            }

            defaultSuffixStarted = true;
            validateRuntimeValue(kind, options.default, name, true);
        } else if (defaultSuffixStarted) {
            throw new TypeError(
                `schema 字段 ${name} 没有 default；带 default 的兼容字段必须全部位于 schema 末尾`,
            );
        }
    });
}

function isFieldKind(value: unknown): value is CompactFieldKind {
    return value === "string" || value === "int" || value === "number" || value === "boolean";
}

function encodeStoredValue(
    kind: CompactFieldKind,
    value: unknown,
    field: string,
): string | number {
    validateRuntimeValue(kind, value, field, false);

    if (kind === "boolean") return value ? 1 : 0;
    return value as string | number;
}

function decodeStoredValue(
    kind: CompactFieldKind,
    value: unknown,
): { ok: true; value: string | number | boolean } | { ok: false } {
    switch (kind) {
        case "string":
            return typeof value === "string" ? { ok: true, value } : { ok: false };
        case "int":
            return typeof value === "number" && Number.isSafeInteger(value)
                ? { ok: true, value }
                : { ok: false };
        case "number":
            return typeof value === "number" && Number.isFinite(value)
                ? { ok: true, value }
                : { ok: false };
        case "boolean":
            if (value === 0) return { ok: true, value: false };
            if (value === 1) return { ok: true, value: true };
            return { ok: false };
    }
}

function validateRuntimeValue(
    kind: CompactFieldKind,
    value: unknown,
    field: string,
    schemaDefault: boolean,
): void {
    const prefix = schemaDefault ? "schema default" : "字段";

    switch (kind) {
        case "string":
            if (typeof value !== "string") {
                throw new CompactEncodeError(`${prefix} ${field} 必须是 string`, field);
            }
            return;
        case "int":
            if (typeof value !== "number" || !Number.isSafeInteger(value)) {
                throw new CompactEncodeError(`${prefix} ${field} 必须是安全整数`, field);
            }
            return;
        case "number":
            if (typeof value !== "number" || !Number.isFinite(value)) {
                throw new CompactEncodeError(`${prefix} ${field} 必须是有限 number`, field);
            }
            return;
        case "boolean":
            if (typeof value !== "boolean") {
                throw new CompactEncodeError(`${prefix} ${field} 必须是 boolean`, field);
            }
            return;
    }
}

function getFieldDefault(
    field: CompactFieldDefinition,
):
    | { hasDefault: false }
    | { hasDefault: true; value: string | number | boolean } {
    if (field.length !== 3) return { hasDefault: false };

    const options = field[2] as { default: string | number | boolean };
    return { hasDefault: true, value: options.default };
}

function decodeError<T>(
    code: CompactDecodeErrorCode,
    message: string,
    field?: string,
    fieldIndex?: number,
): CompactDecodeResult<T> {
    return {
        ok: false,
        error: {
            code,
            message,
            field,
            fieldIndex,
        },
    };
}
