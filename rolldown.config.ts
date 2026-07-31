import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

// package.json 的 exports 子路径根文件，作为显式入口防止 barrel 提升折叠
const entryPoints = [
    "src/main.ts",
    "src/Deferred/index.ts",
    "src/Form/main.ts",
    "src/Translate/index.ts",
    "src/Event.ts",
    "src/func.ts",
    "src/constants.ts",
    "src/utils/main.ts",
    "src/Command/main.ts",
    "src/DataBase/index.ts",
];

export default defineConfig({
    input: entryPoints,
    output: {
        dir: "scripts",
        format: "esm",
        preserveModules: true,
        preserveModulesRoot: "src",
    },
    external: (id) => id.startsWith("@minecraft/"),
    plugins: [
        dts({
            // 所有 src 模块都生成声明，保证子路径 exports 的 .d.ts 完整
            entry: ["src/**/*.ts"],
        }),
    ],
});
