# sapi-kit配置

具体类型为：

```ts
interface sapiKitConfig {
    //全局配置
    /**行为包根目录 */
    bpRoot?: string;
    /**材质包根目录 */
    rpRoot?: string;
    /**源代码的目录 */
    srcDir?: string;

    //build配置
    /**打包缓存目录
     *
     * tsconfig的outdir需要和此目录一致
     */
    cacheDir: string;
    /**入口文件(入口文件相对缓存目录的名字) */
    entryPoint: string;
    /** 是否每次构建前清空 scripts 目录（建议在打包异常时开启） */
    shouldClearOutput?: boolean;
    /** 是否通过 npx 调用 tsc。建议在 tsc 无法直接调用（例如未全局安装）时启用，注意可能会降低启动速度。 */
    useNpx?: boolean;
    /**是否使用Typescript Go版本进行编译 */
    useTsGo?: boolean;
    /**是否保留模块划分，默认是 */
    preserveModules?: boolean;

    //copy配置
    /** 构建完成后是否自动复制行为包到游戏目录 */
    shouldCopyToGame?: boolean;
    /** 游戏路径类型："win" 表示默认 Windows 路径，"custom" 表示自定义路径 */
    gamePathMode?: "win" | "custom";
    /** 自定义游戏路径（指向 development_behavior_packs 的上一级目录）
     * 仅当 gamePathMode 为 "custom" 时有效 */
    customGameRoot?: string;
    /** 行为包在 development_behavior_packs 中的文件夹名称 */
    behaviorPackFolderName?: string;
    /** 资源包在 development_resource_packs 中的文件夹名称 */
    resourcePackFolderName?: string;

    //打包配置
    /** 自定义打包名，若未定义，则从manifest.json读取
     *
     * 如果有两个包，打包mcaddon，必须指定名字
     */
    packageName?: string;
    /**自定义名字构造函数*/
    buildName?: (name: string, version: version) => string;
    /** 是否启用二次 zip 压缩（用于上传蓝奏云等平台） */
    enableExtraZip?: boolean;
    /** 打包文件名中是否包含版本号（版本号从 manifest.json 中读取） */
    includeVersionInName?: boolean;
    /** 是否使用逗号格式的版本号如 v1,x,x 以兼容某些玩家导入问题 */
    useCommaStyleVersion?: boolean;

    /**生成命令默认设置 */
    gen?: {
        /**items等使用的版本*/
        format_version?: string;
        /**maniFest的format_version */
        manifest?: number;
    };
    /**自定义钩子 */
    hooks?: {
        afterBundle?: (ctx: HookContext) => void | Promise<void>;
    };
}
```

## 示例

### 纯行为包示例

```ts
//sapi-kit.config.mjs
export default {
    bpRoot: "./",
    rpRoot: undefined,
    useTsGo: true,
    //build配置
    cacheDir: "./cache",
    entryPoint: "main.js",
    shouldClearOutput: true,
    useNpx: false,
    shouldCopyToGame: false,
    gamePathMode: "win",
    customGameRoot: "xxx",
    behaviorPackFolderName: "sorterBE",
    resourcePackFolderName: undefined,
    packageName: "自动整理",
    buildName(name, version) {
        return name + "v" + version.join(",");
    },
    enableExtraZip: true,
    includeVersionInName: true,
    useCommaStyleVersion: true,
};
```

对应的tsconfig如下，注意outDir需要与cacheDir一致。

```json
//tsconfig.json
{
    "compilerOptions": {
        "target": "esnext",
        "moduleResolution": "bundler",
        "module": "esnext",
        "lib": ["ESNext", "DOM"],
        "types": [],
        "declaration": false,
        "noLib": false,
        "sourceMap": false,
        "pretty": true,
        "forceConsistentCasingInFileNames": true,
        "preserveConstEnums": true,
        "strict": true,
        "noImplicitAny": true,
        "outDir": "cache",
        "rootDir": "src",
        "allowJs": true,
        "incremental": true,
        "tsBuildInfoFile": "cache/tsbuildinfo.json",
        "skipLibCheck": true
    },
    "include": ["./src"],
    "compileOnSave": false
}
```

### 行为包+资源包示例

```ts
export default {
    bpRoot: "./bp",
    rpRoot: "./rp",
    cacheDir: "./cache",
    entryPoint: "main.js",
    shouldClearOutput: true,
    useNpx: true,
    useTsGo: true,
    shouldCopyToGame: true,
    gamePathMode: "win",
    behaviorPackFolderName: "pianoBP",
    resourcePackFolderName: "pianoRP",

    packageName: "pianoBE", //有两个包，必须指定名字
};
```
