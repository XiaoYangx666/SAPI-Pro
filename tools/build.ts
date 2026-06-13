import { rm, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import AdmZip from "adm-zip";

async function recreateDir(dir: string) {
    await rm(dir, {
        recursive: true,
        force: true,
    });

    await mkdir(dir, {
        recursive: true,
    });
}

function zipDirectory(sourceDir: string, outputZip: string) {
    const zip = new AdmZip();

    zip.addLocalFolder(sourceDir);

    zip.writeZip(outputZip);
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

        zipDirectory(sourceDir, outputZip);

        console.log(`已压缩: ${outputZip}`);
    }

    console.log("打包完成");
}

main().catch(console.error);
