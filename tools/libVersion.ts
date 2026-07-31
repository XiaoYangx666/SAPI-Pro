import { readFileSync } from "node:fs";
import { join } from "node:path";

// 从 package.json 读取版本，供 rolldown 构建与 vitest 测试通过 define 注入
const { version } = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), "utf8")
) as { version: string };

// 去掉预发布后缀（如 -beta.1），取 major.minor.patch
const [core] = version.split("-");
const [major = 0, minor = 0, patch = 0] = core.split(".").map(Number);

/** 显示版本：仅 major.minor.patch（beta/stable 由 isBeta 拼接后缀） */
export const libVersionString = `${major}.${minor}.${patch}`;

/** 数字版本：用于主机选举，编码与旧版一致（major + minor/10 + patch/100） */
export const libVersionNum = (major * 100 + minor * 10 + patch) / 100;
