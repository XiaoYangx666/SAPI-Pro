# SAPI-Pro

![Requires](https://img.shields.io/badge/Requires-SAPI%202.6.0%20Beta-red) ![Support](https://img.shields.io/badge/Support-MCBE%2026.10+-green)

> The stable branch is dedicated to the stable API and has some features removed (the documentation is for reference only).

[简体中文](README.md)|[English](README_EN.md)

## Table of Contents

- [Installation](#-installation)
    - [Create with sapi-kit (Recommended)](#method-1-create-with-sapi-kit-recommended)
    - [Manual Installation for Existing Projects](#method-2-manual-installation-for-existing-projects)
- [Core Features](#core-features)
    - [Command System](#command-system)
    - [Form Navigation](#form-navigation)
    - [Data Storage](#data-storage)
    - [Multi-pack Communication](#multi-pack-communication)
    - [Multi-language Support](#multi-language-support)
- [Example Behavior Packs](#example-behavior-packs)
- [Reference Documentation](#reference-documentation)
- [Support & Contribution](#support--contribution)

---

## 📦 Installation

### Method 1: Create with sapi-kit (Recommended)

If you want to create a new script behavior pack based on SAPI-Pro, you can use sapi-kit. sapi-kit provides template packs and supports compilation, third-party library packaging, version updates, and more, making development easier.

1. Install sapi-kit

    ```bash
    npm i -g sapi-kit
    ```

2. Navigate to your project directory, initialize the project, and select sapi-pro during pre-installation

    ```bash
    sapi-kit init
    ```

3. Initialize the library in src/main.ts

    ```typescript
    //src/main.ts
    import { PackInfo, initSAPIPro } from "sapi-pro";
    const packInfo: PackInfo = {
        name: "Behavior Pack Name", // behavior pack name
        version: "1.0.0", // behavior pack version
        author: "Author", // author
        nameSpace: "sapipro", // namespace
        description: "Behavior pack description", // pack description
    };
    // Initialize the library
    initSAPIPro(packInfo);
    ```

For more information about sapi-kit: [ScriptApi-Kit](https://gitee.com/ykxyx666_admin/script-api-kit)

> **Note**  
> If you're not using TypeScript, you can write JavaScript code directly in the src folder.  
> The library must be initialized before use.

### Method 2: Manual Installation for Existing Projects

1.  Install the library using npm

    ```bash
    npm i sapi-pro
    ```

2.  Initialize the library:

    ```typescript
    //src/main.ts
    import { PackInfo, initSAPIPro } from "sapi-pro";
    const packInfo: PackInfo = {
        name: "Behavior Pack Name", // behavior pack name
        version: "1.0.0", // behavior pack version
        author: "Author", // author
        nameSpace: "sapipro", // namespace
        description: "Behavior pack description", // pack description
    };
    // Initialize the library
    initSAPIPro(packInfo);
    ```

---

## Core Features

### Command System

The command system supports both built-in commands and native Minecraft commands. You can register simulated commands starting with "." and in-game commands starting with "/".

Commands can be created using the `Command` constructor or `Command.fromObject`. The latter is recommended for more complex commands.

Below are two simple command registration examples. You can also create more complex commands—please refer to [Command Registration](./tutorial/command.md).

#### Command Examples

```typescript
import { Player, system } from "@minecraft/server";
import { Command, pcommand } from "sapi-pro";

const ExampleCmd = new Command("test", "Command test", false, (player, param) => {
    player.sendMessage("SAPI-Pro, ready!");
});
const killCmd = Command.fromObject({
    name: "kill", // command name
    explain: "Self-termination", // command description
    handler(player, param) {
        // command handler function
        system.run(() => {
            player.kill(); // read-only mode, requires system.run
        });
    },
});
// Register
pcommand.registerCommand(ExampleCmd);
pcommand.registerCommand(killCmd);
// Register native game command
pcommand.registerNative(ExampleCmd);
```

#### Performance

Testing shows 10,000 commands are parsed in 1100ms, averaging 9 commands/ms. 300+ commands can be parsed in 1 tick, which is more than sufficient.

---

### Form Navigation

With SAPI-Pro, you can easily create forms and navigate between them.

Below is a simple example of a form that repeatedly prompts the user for input. Forms have many more features—check [Form System](./tutorial/form.md#form-system) for details.

#### Form Example

```typescript
// Register form
const testForm: SAPIProForm<ModalFormData> = {
    builder: (player, args) => {
        const form = new ModalFormData().title("Test Form").textField("1+1=?", "114514");
        args.ans = 2;
        return form;
    },
    handler: (res: ModalFormResponse, ctx) => {
        if (res.formValues) {
            if (parseInt(res.formValues[0] as string) == ctx.args.ans) {
                ctx.player.sendMessage("666 Correct!");
                return;
            }
        }
        ctx.player.sendMessage("Noob, practice more.");
        ctx.reopen();
    },
};
// Register command to open the form
pcommand.registerCommand(
    new Command("formtest", "Form test", false, (player) => {
        formManager.open(player, testForm, {}, 10);
    })
);
```

---

### Data Storage

For data storage, SAPI-Pro provides three classes: `DPDataBase`, `ScoreBoardJSONDataBase`, and `ScoreBoardDataBase`. These encapsulate vanilla data storage for faster and more convenient use, and support segmented storage for large texts—even storing 10 novels is no problem.

#### Dynamic Storage Example

```typescript
import { Configdb } from "sapi-pro";
// Store a numeric value (also supports string, Vector3, boolean)
Configdb.set("test", 1);
// Store an object
Configdb.setJSON("info", { author: "XiaoYangx666", version: 0.1 });
// Retrieve stored data
const testValue = Configdb.get("test") as number;
const info = Configdb.getJSON("info") as any;
// Display
world.sendMessage(testValue.toString());
world.sendMessage(info.author);
```

> Output
> 1
> XiaoYangx666

---

### Multi-pack Communication

When multiple packs use SAPI-Pro, one will be elected as the main behavior pack. Command registration is managed by the main pack, but command execution is still handled by each individual pack, avoiding conflicts.

The form system supports using `formManager.openExternal` to open forms registered by other behavior packs.

Scoreboard storage can be used to conveniently share data across multiple packs.

---

### Multi-language Support

sapi-pro supports multiple languages. Instead of using traditional string keys for translation, language packs are defined using an object structure and used directly with a translation function:

```ts
import { defineLangTree, translator } from "sapi-pro";
// Define language text object
export const LangUI = defineLangTree({
    title: {
        zh_CN: "设置",
        en_US: "Settings",
        ja_JP: "設定",
    },
});

// Use translation in code
const t = translator.createFor(player);
const form = new ModalFormData().title(t("设置", LangUI.title));
```

---

## Example Behavior Packs

[Auto Sorter](https://gitee.com/ykxyx666_admin/sorter-be)

[MCBE Music Player](https://gitee.com/ykxyx666_admin/music-player-mcbe)

[Simple SimulatedPlayer](https://gitee.com/ykxyx666_admin/simple-sp)

## Reference Documentation

[SAPI-Pro Reference Documentation](./tutorial/README.md)

## Support & Contribution

Contributions and feedback are welcome!

Issue feedback: <2408807389@qq.com>

GitHub Repository: [https://github.com/XiaoYangx666/SAPI-Pro](https://github.com/XiaoYangx666/SAPI-Pro)

Gitee Repository: [gitee.com/ykxyx666_admin/SAPI-Pro](https://gitee.com/ykxyx666_admin/SAPI-Pro)

> 🛠️ Recommended Development Environment:
>
> - VSCode
> - TypeScript 5.7+
> - Node.js 20+
