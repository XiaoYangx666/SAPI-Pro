import { readFileSync } from "node:fs";

export interface LibVersion {
    /** 显示版本：仅 major.minor.patch（beta/stable 由 isBeta/渠道决定） */
    libVersionString: string;
    /** 数字版本：用于主机选举，编码与旧版一致（major + minor/10 + patch/100） */
    libVersionNum: number;
}

/**
 * 从指定 package.json 读取版本，供 rolldown / vitest 通过 define 注入。
 *
 * beta/stable 两个 variant 各自有自己的 package.json 与版本号，
 * 各自构建时把本 variant 的版本注入为编译常量。
 */
export function getLibVersion(packageJsonPath: string): LibVersion {
    const { version } = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
        version: string;
    };

    // 去掉预发布后缀（如 -beta.1），取 major.minor.patch
    const [core] = version.split("-");
    const [major = 0, minor = 0, patch = 0] = core.split(".").map(Number);

    return {
        libVersionString: `${major}.${minor}.${patch}`,
        libVersionNum: (major * 100 + minor * 10 + patch) / 100,
    };
}
