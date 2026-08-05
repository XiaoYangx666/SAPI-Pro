// 构建时由 rolldown / vitest 通过 define 替换注入，这里仅声明类型供 tsc 与声明生成使用
declare const __BETA__: boolean;
declare const __SAPI_PRO_VERSION__: string;
declare const __SAPI_PRO_VERSION_NUM__: number;
