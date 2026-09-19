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
    | "invalid_header"
    | "schema_mismatch"
    | "invalid_length"
    | "truncated_field"
    | "invalid_value"
    | "missing_field"
    | "extra_data";

export interface CompactDecodeError {
    code: CompactDecodeErrorCode;
    message: string;
    field?: string;
    fieldIndex?: number;
    offset: number;
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
 * 按 schema 中的字段顺序进行紧凑位置编码。
 *
 * 记录格式：
 * `<fieldCount(base36)>;<payloadLength(base36)>:<payload>...`
 *
 * 字段名与类型不写入数据；每个 payload 都带长度，因此字符串内容不需要任何转义。
 * fieldCount 用于区分旧 schema 记录与“尾部刚好被截断”的损坏记录。
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
                if (field.length >= 3) {
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
        const keys = Object.keys(record);
        if (
            keys.length !== this.fields.length ||
            keys.some((key) => !this.fieldNames.has(key)) ||
            this.fields.some(([name]) => !Object.prototype.hasOwnProperty.call(record, name))
        ) {
            throw new CompactEncodeError("数据字段必须与 schema 完全一致，不能缺少或增加字段");
        }

        let output = `${this.fields.length.toString(36)};`;
        for (const [name, kind] of this.fields) {
            const payload = encodeValue(kind, record[name], name);
            output += `${payload.length.toString(36)}:${payload}`;
        }
        return output;
    }

    decode(input: unknown): CompactDecodeResult<CompactStructValue<TFields>> {
        if (typeof input !== "string") {
            return decodeError(
                "invalid_input",
                "紧凑结构存储值必须是字符串",
                0,
            );
        }

        const headerEnd = input.indexOf(";");
        if (headerEnd <= 0) {
            return decodeError(
                "invalid_header",
                "紧凑结构数据缺少有效的字段数量头",
                0,
            );
        }

        const fieldCountText = input.slice(0, headerEnd);
        if (!/^[0-9a-z]+$/.test(fieldCountText)) {
            return decodeError(
                "invalid_header",
                "字段数量头不是合法的 base36 整数",
                0,
            );
        }

        const storedFieldCount = Number.parseInt(fieldCountText, 36);
        if (
            !Number.isSafeInteger(storedFieldCount) ||
            storedFieldCount < 1 ||
            storedFieldCount.toString(36) !== fieldCountText
        ) {
            return decodeError(
                "invalid_header",
                "字段数量头超出范围或不是规范编码",
                0,
            );
        }

        if (storedFieldCount > this.fields.length) {
            return decodeError(
                "schema_mismatch",
                `存储记录包含 ${storedFieldCount} 个字段，但当前 schema 只有 ${this.fields.length} 个字段`,
                0,
            );
        }

        const result: Record<string, string | number | boolean> = {};
        let offset = headerEnd + 1;

        for (let fieldIndex = 0; fieldIndex < storedFieldCount; fieldIndex++) {
            const [name, kind] = this.fields[fieldIndex];

            if (offset === input.length) {
                return decodeError(
                    "truncated_field",
                    `记录声明包含字段 ${name}，但数据在该字段前结束`,
                    offset,
                    name,
                    fieldIndex,
                );
            }

            const colon = input.indexOf(":", offset);
            if (colon < 0) {
                return decodeError(
                    "invalid_length",
                    `字段 ${name} 缺少长度分隔符`,
                    offset,
                    name,
                    fieldIndex,
                );
            }

            const lengthText = input.slice(offset, colon);
            if (!/^[0-9a-z]+$/.test(lengthText)) {
                return decodeError(
                    "invalid_length",
                    `字段 ${name} 的长度编码无效`,
                    offset,
                    name,
                    fieldIndex,
                );
            }

            const payloadLength = Number.parseInt(lengthText, 36);
            if (
                !Number.isSafeInteger(payloadLength) ||
                payloadLength < 0 ||
                payloadLength.toString(36) !== lengthText
            ) {
                return decodeError(
                    "invalid_length",
                    `字段 ${name} 的长度超出范围或不是规范编码`,
                    offset,
                    name,
                    fieldIndex,
                );
            }

            const payloadStart = colon + 1;
            const payloadEnd = payloadStart + payloadLength;
            if (payloadEnd > input.length) {
                return decodeError(
                    "truncated_field",
                    `字段 ${name} 的内容被截断`,
                    payloadStart,
                    name,
                    fieldIndex,
                );
            }

            const payload = input.slice(payloadStart, payloadEnd);
            const decoded = decodeValue(kind, payload);
            if (!decoded.ok) {
                return decodeError(
                    "invalid_value",
                    `字段 ${name} 的 ${kind} 值格式无效`,
                    payloadStart,
                    name,
                    fieldIndex,
                );
            }

            result[name] = decoded.value;
            offset = payloadEnd;
        }

        if (offset !== input.length) {
            return decodeError(
                "extra_data",
                "记录声明的字段读取完成后仍存在多余数据",
                offset,
            );
        }

        for (let fieldIndex = storedFieldCount; fieldIndex < this.fields.length; fieldIndex++) {
            const field = this.fields[fieldIndex];
            const defaultResult = getFieldDefault(field);
            if (!defaultResult.hasDefault) {
                return decodeError(
                    "missing_field",
                    `旧记录缺少当前 schema 的字段 ${field[0]}，且该字段没有 default`,
                    offset,
                    field[0],
                    fieldIndex,
                );
            }
            result[field[0]] = defaultResult.value;
        }

        return {
            ok: true,
            value: result as CompactStructValue<TFields>,
        };
    }
}

/**
 * 只允许读写固定 schema 的结构化数据，并使用 Dynamic Property 持久化。
 *
 * schema 数组顺序就是持久化协议中的字段位置。已投入使用后：
 * - 不得重排、删除字段或在中间插入字段；
 * - 需要兼容旧记录时，只能在末尾追加带 default 的字段。
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
        super(name, "sDP", source === world);

        this.codec = codec;
        this.storage = new DPDataBase(name, source);
        this.logger = new Logger(`${CompactDPDataBase.name}_${name}`);

        // world-backed 的内部 DPDataBase 会先占用同名全局注册项；
        // 对外必须暴露只允许结构化数据的 facade，避免绕过 schema 写入任意 DPValueTypes。
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
                `读取紧凑结构数据失败,key:${key},code:${result.error.code},field:${result.error.field ?? "-"},offset:${result.error.offset}`,
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
        if (raw === undefined) return { status: "missing" };

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
    if (fields.length === 0) {
        throw new TypeError("紧凑结构 schema 至少需要一个字段");
    }

    const names = new Set<string>();
    let defaultSuffixStarted = false;

    fields.forEach((field, fieldIndex) => {
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

        const defaultResult = getFieldDefault(field);
        if (defaultResult.hasDefault) {
            defaultSuffixStarted = true;
            validateRuntimeValue(kind, defaultResult.value, name, true);
        } else if (defaultSuffixStarted) {
            throw new TypeError(
                `schema 字段 ${name} 没有 default；带 default 的兼容字段必须全部位于 schema 末尾`,
            );
        } else if (field.length >= 3) {
            throw new TypeError(`schema 字段 ${name} 的选项必须包含 default`);
        }
    });
}

function isFieldKind(value: unknown): value is CompactFieldKind {
    return value === "string" || value === "int" || value === "number" || value === "boolean";
}

function encodeValue(kind: CompactFieldKind, value: unknown, field: string): string {
    validateRuntimeValue(kind, value, field, false);

    switch (kind) {
        case "string":
            return value as string;
        case "int":
            return (value as number).toString(36);
        case "number":
            return String(value);
        case "boolean":
            return value ? "1" : "0";
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

function decodeValue(
    kind: CompactFieldKind,
    payload: string,
): { ok: true; value: string | number | boolean } | { ok: false } {
    switch (kind) {
        case "string":
            return { ok: true, value: payload };
        case "int": {
            if (!/^-?[0-9a-z]+$/.test(payload)) return { ok: false };
            const value = Number.parseInt(payload, 36);
            if (!Number.isSafeInteger(value) || value.toString(36) !== payload) {
                return { ok: false };
            }
            return { ok: true, value };
        }
        case "number": {
            if (payload.length === 0) return { ok: false };
            const value = Number(payload);
            if (!Number.isFinite(value) || String(value) !== payload) {
                return { ok: false };
            }
            return { ok: true, value };
        }
        case "boolean":
            if (payload === "0") return { ok: true, value: false };
            if (payload === "1") return { ok: true, value: true };
            return { ok: false };
    }
}

function getFieldDefault(
    field: CompactFieldDefinition,
):
    | { hasDefault: false }
    | { hasDefault: true; value: string | number | boolean } {
    if (field.length < 3) return { hasDefault: false };

    const options = field[2] as { default?: string | number | boolean } | undefined;
    if (!options || !Object.prototype.hasOwnProperty.call(options, "default")) {
        return { hasDefault: false };
    }
    return { hasDefault: true, value: options.default as string | number | boolean };
}

function decodeError<T>(
    code: CompactDecodeErrorCode,
    message: string,
    offset: number,
    field?: string,
    fieldIndex?: number,
): CompactDecodeResult<T> {
    return {
        ok: false,
        error: {
            code,
            message,
            offset,
            field,
            fieldIndex,
        },
    };
}
