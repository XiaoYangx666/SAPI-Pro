import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
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
