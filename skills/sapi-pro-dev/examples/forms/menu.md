```ts
const clockMenu: ButtonFormData = {
    title: clockMenuText.title,
    body: clockMenuText.body,
    buttons: [
        {
            icon: "ui/gift_square",
            label: clockMenuText.checkIn,
            func: (ctx) => {
                ctx.push(checkInUI);
            },
        },
        {
            icon: "blocks/chest_front",
            label: clockMenuText.sorter,
            func: (ctx) => {
                formManager.openExternal(ctx.player, "sorter", "sorter.main");
            },
        },
        {
            icon: "ui/FriendsIcon",
            label: clockMenuText.tpa,
            func: (ctx) => {
                ctx.pushNamed("tpa.main");
            },
        },
        {
            icon: "blocks/jukebox_top",
            label: clockMenuText.musicPlayer,
            func: (ctx) => {
                system.sendScriptEvent("music:open", ctx.player.id);
            },
        },
        {
            icon: "ui/dressing_room_skins",
            label: clockMenuText.simulatedPlayer,
            func: (ctx) => {
                formManager.openExternal(ctx.player, "simplesp", "sp.main");
            },
        },
        {
            icon: "blocks/portal_placeholder",
            label: clockMenuText.tools,
            func: (ctx) => {
                ctx.pushNamed("tools");
            },
        },
        {
            icon: "ui/enable_editor",
            label: clockMenuText.aiChat,
            func: (ctx) => {
                ctx.pushNamed("aichat.main");
            },
        },
        {
            icon: "ui/recipe_book_icon.png",
            label: clockMenuText.statistics,
            func: (ctx) => {
                ctx.push(statisticsForm);
            },
        },
        {
            icon: "ui/timer",
            label: clockMenuText.behavior,
            func: (ctx) => {
                ctx.push(BehaviorFilterForm);
            },
        },
        {
            icon: "gui/newgui/Language18.png",
            label: clockMenuText.langSetting,
            func: (ctx) => {
                ctx.push(LangSettingForm);
            },
        },
    ],
};
const menu = CommonForm.ButtonForm(clockMenu);
```
