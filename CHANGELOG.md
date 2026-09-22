# Changelog

## 0.4.3 — 待发布

本版本准备同时发布两个 npm 渠道：Beta `sapi-pro@0.4.3`（`latest` / `beta`），Stable `sapi-pro@0.4.3-stable`（`stable`）。

### 新增

- `CompactDPDataBase` / `CompactStructCodec`：按照固定 schema 顺序使用紧凑 JSON 数组存储结构化数据；校验字段与类型；`read()` 区分 `ok`、`missing`、`invalid`。兼容末尾追加带默认值字段，支持世界和实体等 DPSource。

### 修复

- 实体/局部 DP 数据库不再进入全局 `DataBase.DBMap`，不会覆盖同名世界数据库。
- `DPDataBase.clear()` 只清理精确的数据库命名空间；`keys()` 支持下划线键。
- 修复普通值与分片大字符串切换时的旧数据遮蔽与残留；损坏的分片标记不再触发旧普通值回退，异常长度不会直接触发巨大数组分配或无界循环；完整的旧版超大分片记录仍可读取。
- `NameDB.updateInterval` 按秒解释（默认 60 秒），修复自动刷新过于频繁的问题。
- Dev 工作流保留测试与双渠道构建、不再上传构建产物；带渠道后缀的 tag 不会重复触发双渠道 Release。

### 行为与兼容性

- 不更改原有 DP 分片格式。1024 片仅为额外校验阈值，**不是大小限制**。
- 正常读写、删除不会为了损坏数据清理而全量枚举世界 DP；长度标记丢失或错误地记录为较小的有效整数时，孤立分片可能保留。
- `CompactDPDataBase` 的 schema 字段位置是持久化协议；已使用的字段不可重排、删除或改变类型，兼容新字段只能追加到末尾并提供默认值。

### 发版检查

- 两个 variant 的 `package.json` 与 `package-lock.json` 版本一致；仓库根部编排包 `sapi-pro-monorepo@0.0.0` 不随库版本升级。
- 确认 `npm test`、`npm run build` 通过双渠道校验。
- 本次仅准备发版；正式发布时创建唯一基础版本 tag `v0.4.3` 触发 Release 工作流，再检查 GitHub Release 附件与 npm `latest` / `beta` / `stable` dist-tags。
