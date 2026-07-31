import { defineConfig } from "vitest/config";
import path from "path";
import { libVersionNum, libVersionString } from "./tools/libVersion";

export default defineConfig({
    // 与 rolldown.config.ts 相同的版本注入，保证测试环境可解析
    define: {
        __SAPI_PRO_VERSION__: JSON.stringify(libVersionString),
        __SAPI_PRO_VERSION_NUM__: String(libVersionNum),
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@test": path.resolve(__dirname, "test"),
        },
    },
    test: {
        include: ["test/**/*.test.ts"],
        setupFiles: [],
    },
});
