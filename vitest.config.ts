import { defineConfig } from "vitest/config";
import path from "node:path";
import { getLibVersion } from "./tools/libVersion";

// 测试针对完整的 beta 版源码（chatBus/模拟命令等全功能），版本常量与 beta variant 保持一致
const { libVersionString, libVersionNum } = getLibVersion(
    path.resolve(__dirname, "variants/beta/package.json")
);

export default defineConfig({
    // 与 rolldown 各 variant 的 transform.define 保持一致的版本注入，保证测试环境可解析
    define: {
        __BETA__: "true",
        __SAPI_PRO_VERSION__: JSON.stringify(libVersionString),
        __SAPI_PRO_VERSION_NUM__: String(libVersionNum),
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "packages/core/src"),
            "@test": path.resolve(__dirname, "packages/core/test"),
        },
    },
    test: {
        include: ["packages/core/test/**/*.test.ts"],
    },
});
