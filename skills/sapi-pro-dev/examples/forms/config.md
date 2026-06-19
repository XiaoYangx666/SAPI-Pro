```ts
const userConfigForm = CommonForm.ConfigForm().create(
    {
        // 整理方法
        method: {
            type: FieldType.Dropdown,
            label: UserSettingLang.methods,
            items: sortMethods.map((m) => m.name),
        },
        // 整理表
        table: {
            type: FieldType.Dropdown,
            label: UserSettingLang.table,
            items: orderTables.map((t) => t.name),
            tooltip: UserSettingLang.table_tip,
        },
        // 方向
        dir: {
            type: FieldType.Dropdown,
            label: UserSettingLang.dir,
            items: (player) => {
                const t = translator.createPureFor(player);
                return sortDirs.map((d) => t(UILang.dir, { dir: d.name }));
            },
        },
        // 自动整理
        auto: {
            type: FieldType.Boolean,
            label: UserSettingLang.auto,
        },
        // 自动整理背包
        auto_back: {
            type: FieldType.Boolean,
            label: UserSettingLang.auto_back,
        },
    },
    {
        title: UserSettingLang.title,
        initialValues: (player) => getUserConfig(player),
        onCancel(player, ctx) {
            ctx.back();
        },
        onSubmit(data, player, ctx) {
            saveUserConfig(player, data);
            system.run(() => {
                mes(player, MessageLang.userConfigSaved);
            });
            ctx.back();
        },
    }
);

const globalConfigForm = CommonForm.ConfigForm().create(
    {
        skipBundle: {
            type: FieldType.Boolean,
            label: GlobalConfigLang.skipBundle,
            tooltip: GlobalConfigLang.skipBundle_tip,
        },
        skipShulkerBox: {
            type: FieldType.Boolean,
            label: GlobalConfigLang.skipShulkerBox,
            tooltip: GlobalConfigLang.skipShulkerBox,
        },
        interval: {
            type: FieldType.Slider,
            label: GlobalConfigLang.interval,
            tooltip: GlobalConfigLang.interval_tip,
            defaultValue: 60,
            min: 30,
            max: 120,
        },
        actionCooldown: {
            type: FieldType.Slider,
            label: GlobalConfigLang.cooldown,
            tooltip: GlobalConfigLang.cooldown_tip,
            defaultValue: 10,
            min: 5,
            max: 20,
        },
    },
    {
        title: GlobalConfigLang.title,
        initialValues: () => {
            return getGlobalConfig();
        },
        onCancel(player, ctx) {
            ctx.back();
        },
        onSubmit(result, player, ctx) {
            setGlobalConfig(result);
            mes(player, GlobalConfigLang.saved);
            ctx.back();
        },
    }
);
```
