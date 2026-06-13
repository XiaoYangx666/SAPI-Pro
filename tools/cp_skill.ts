#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const skillName = "sapi-pro-dev";

// 当前项目中的 skill 路径
const source = path.resolve("skills", skillName);

// Claude skills 目录
const targetDir = path.join(os.homedir(), ".claude", "skills");
const target = path.join(targetDir, skillName);

if (!fs.existsSync(source)) {
    console.error(`Skill not found: ${source}`);
    process.exit(1);
}

// 创建 ~/.claude/skills
fs.mkdirSync(targetDir, { recursive: true });

// 覆盖复制
fs.cpSync(source, target, {
    recursive: true,
    force: true,
});

console.log(`Installed skill: ${skillName}`);
console.log(`From: ${source}`);
console.log(`To:   ${target}`);
