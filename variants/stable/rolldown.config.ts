import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getLibVersion } from "../../tools/libVersion";

const VARIANT = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(VARIANT, "../..");
const CORE = path.join(ROOT, "packages/core/src");
// dts 插件按 process.cwd() 相对路径匹配 entry glob，需与调用时的 cwd 对齐
const CORE_REL = path.relative(process.cwd(), CORE);
const { libVersionString, libVersionNum } = getLibVersion(path.join(VARIANT, "package.json"));

// 与 package.json exports 的 10 个子路径根文件一一对应（显式入口防止 barrel 提升折叠）。
// `.` 与 `./Event` 指向本渠道入口（entry.stable.ts / Event.entry.stable.ts），其余指向共享模块
const entryPoints = [
    "entry.stable.ts",
    "Deferred/index.ts",
    "Form/main.ts",
    "Translate/index.ts",
    "Event.entry.stable.ts",
    "func.ts",
    "constants.ts",
    "utils/main.ts",
    "Command/main.ts",
    "DataBase/index.ts",
].map((f) => path.join(CORE, f));

export default defineConfig({
    input: entryPoints,
    output: {
        dir: path.join(VARIANT, "dist"),
        format: "esm",
        preserveModules: true,
        // 全部源码（含渠道入口）都在 packages/core/src，dist 直接镜像成 dist/main.js、dist/Event.js 等
        preserveModulesRoot: CORE,
    },
    external: (id) => id.startsWith("@minecraft/"),
    resolve: {
        alias: {
            "@": CORE,
        },
    },
    tsconfig: path.join(ROOT, "tsconfig.stable.json"),
    // 构建期条件编译：__BETA__ 注入为字面量 false，chatBus/模拟命令等 beta 专属代码被死代码消除
    transform: {
        define: {
            __BETA__: "false",
            __SAPI_PRO_VERSION__: JSON.stringify(libVersionString),
            __SAPI_PRO_VERSION_NUM__: String(libVersionNum),
        },
    },
    // stable 渠道把模拟命令子系统与 chatBus 实例视为无副作用模块：
    // main.ts 里对它们的 import 在 __BETA__=false 下成为未使用 import，整体丢弃，相关文件不进产物
    treeshake: {
        moduleSideEffects: [
            { test: /Event[\/\\]chatBus\.ts$/, sideEffects: false },
            { test: /Command[\/\\]parser[\/\\]parser\.ts$/, sideEffects: false },
            { test: /Command[\/\\]parser[\/\\]func\.ts$/, sideEffects: false },
            { test: /Command[\/\\]help\.ts$/, sideEffects: false },
        ],
    },
    plugins: [
        dts({
            // 用本渠道 tsconfig 解析 @minecraft 版本与别名
            tsconfig: path.join(ROOT, "tsconfig.stable.json"),
            // rootDir 对齐 output.preserveModulesRoot，保证 .d.ts 与 .js 输出路径一致（dist/main.d.ts 等）
            compilerOptions: { rootDir: CORE },
            // 共享源码 + 本渠道入口生成声明；排除 beta 渠道入口与 stable 剔除的模块
            entry: [
                `${CORE_REL}/**/*.ts`,
                `!${CORE_REL}/global.d.ts`,
                `!${CORE_REL}/entry.beta.ts`,
                `!${CORE_REL}/Event.entry.beta.ts`,
                `!${CORE_REL}/Event/chatBus.ts`,
                `!${CORE_REL}/Command/parser/parser.ts`,
                `!${CORE_REL}/Command/parser/func.ts`,
                `!${CORE_REL}/Command/help.ts`,
            ],
        }),
    ],
});
