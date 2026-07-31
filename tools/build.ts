import { rm, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { zipSync } from "fflate";

async function recreateDir(dir: string) {
    await rm(dir, {
        recursive: true,
        force: true,
    });

    await mkdir(dir, {
        recursive: true,
    });
}

/** 递归收集目录下所有文件，key 为 zip 内相对路径 */
async function collectFiles(sourceDir: string): Promise<Record<string, Uint8Array>> {
    const files: Record<string, Uint8Array> = {};

    const walk = async (current: string) => {
        const entries = await readdir(current, { withFileTypes: true });

        for (const entry of entries) {
            const full = join(current, entry.name);

            if (entry.isDirectory()) {
                await walk(full);
                continue;
            }

            if (!entry.isFile()) {
                continue;
            }

            const rel = relative(sourceDir, full).split("\\").join("/");

            files[rel] = new Uint8Array(await readFile(full));
        }
    };

    await walk(sourceDir);

    return files;
}

async function zipDirectory(sourceDir: string, outputZip: string) {
    const files = await collectFiles(sourceDir);

    const data = zipSync(files);

    await writeFile(outputZip, data);
}

async function main() {
    const buildDir = "build";

    await recreateDir(buildDir);

    const zipTasks: Array<[string, string]> = [
        ["src", "SAPI-Pro_ts.zip"],
        ["scripts", "SAPI-Pro_js.zip"],
    ];

    for (const [sourceDir, zipName] of zipTasks) {
        if (!existsSync(sourceDir)) {
            console.warn(`目录不存在: ${sourceDir}`);
            continue;
        }

        const outputZip = join(buildDir, zipName);

        await zipDirectory(sourceDir, outputZip);

        console.log(`已压缩: ${outputZip}`);
    }

    console.log("打包完成");
}

main().catch(console.error);
