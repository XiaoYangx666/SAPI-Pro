# SAPI-Pro

![Requires](https://img.shields.io/badge/Dependency-SAPI%202.2.0%20Beta-red) ![Support](https://img.shields.io/badge/Supported%20Version-MCBE1.21.100-green)

> Translated by deepseek

[简体中文](README.md)|[English](README_EN.md)

## Table of Contents

-   [Installation](#installation)
    -   [Create from Template](#method-1-basic-template-creation-recommended)
    -   [Existing Project Integration](#method-2-existing-project-integration)
-   [Core Features](#core-features)
    -   [Command System](#command-system)
    -   [Form Navigation](#form-navigation)
    -   [Data Storage](#data-storage)
    -   [Multi-Package Communication](#multi-package-communication)
-   [Example Behavior Packs](#example-behavior-packs)
-   [Documentation](#reference-documentation)
-   [Support & Contribution](#support-and-contribution)

---

## 📦 Installation

### Method 1: Using sapi-kit to Create (Recommended)

If you want to create a new script behavior pack based on SAPI-Pro, you can use sapi-kit. sapi-kit provides template packs and supports features like compilation, third-party library packaging, version updates, and more, making development easier.

1. Install sapi-kit

    ```bash
    npm i -g sapi-kit
    ```

2. Initialize the project in your project directory

    ```bash
    sapi-kit init
    ```

3. Install SAPI-Pro
    ```bash
    npm i sapi-pro
    ```
4. Initialize the library in src/main.ts

```typescript
//src/main.ts
import { PackInfo, initSAPIPro } from "sapi-pro";
const packInfo: PackInfo = {
    name: "Behavior Pack Name", //Behavior pack name
    version: "1.0.0", //Behavior pack version
    author: "Author", //Author
    nameSpace: "sapipro", //Namespace
    description: "Behavior pack description", //Pack description
};
// Initialize the library
initSAPIPro(packInfo);
```

For more information about sapi-kit: [ScriptApi-Kit](https://gitee.com/ykxyx666_admin/script-api-kit).

> **Note**
> If you are not using TypeScript, you can directly write JS code in the src folder.
> The library must be initialized to function properly.

### Method 2: Manual Integration into an Existing Project

1. Download: [Latest Version](https://github.com/XiaoYangx666/SAPI-Pro/releases/latest) Please download the ts or js version.

2. Extract the library files into the project directory: (JS version is similar)

    ```bash
    📂 your_project/
    └── 📂 src/
        └── 📂 SAPI-Pro/
            ├── Command/
            ├── Form/
            ├── DataBase.ts
            └── main.ts
    ```

3. Initialize the library:
    ```typescript
    //src/main.ts
    import { PackInfo, initSAPIPro } from "sapi-pro";
    const packInfo: PackInfo = {
        name: "Behavior Pack Name", //Behavior pack name
        version: "1.0.0", //Behavior pack version
        author: "Author", //Author
        nameSpace: "sapipro", //Namespace
        description: "Behavior pack description", //Pack description
    };
    // Initialize the library
    initSAPIPro(packInfo);
    ```

---

## Core Features

### Command System

The command system supports built-in commands and native game commands, allowing registration of "." prefixed simulated commands and "/" prefixed in-game commands.

You can create commands using the Command constructor or Command.fromObject. For complex commands, the latter is recommended.

Here are two simple command registration examples. You can also create more complex commands. Please read [Command Registration](./tutorial/command.md).

#### Command Example

```typescript
import { Player, system } from "@minecraft/server";
import { Command, pcommand } from "sapi-pro";

const ExampleCmd = new Command("test", "Command Test", false, (player, param) => {
    player.sendMessage("SAPI-Pro, activate!");
});
const killCmd = Command.fromObject({
    name: "kill", // Command name
    explain: "Suicide", // Command explanation
    handler(player, param) {
        // Command handler
        system.run(() => {
            player.kill(); // Read-only mode, requires system.run
        });
    },
});
// Register
pcommand.registerCommand(ExampleCmd);
pcommand.registerCommand(killCmd);
//Register game command
pcommand.registerNative(ExampleCmd);
```

#### Performance

Tested 10000 command parsing takes 1100ms, averaging 9 commands/ms. 1 tick can parse 300+ commands, which is more than enough.

---

### Form Navigation

With SAPI-Pro, you can easily create forms and perform form navigation operations.

Here is a simple example of a form that continuously prompts the user for input. For more usage, please refer to [Form System](./tutorial/form.md#表单系统).

#### Form Example

```typescript
//Register form
const testForm: SAPIProForm<ModalFormData> = {
    builder: (player, args) => {
        const form = new ModalFormData().title("Test Form").textField("1+1=?", "114514");
        args.ans = 2;
        return form;
    },
    handler: (res: ModalFormResponse, ctx) => {
        if (res.formValues) {
            if (parseInt(res.formValues[0] as string) == ctx.args.ans) {
                ctx.player.sendMessage("666 Correct answer");
                return;
            }
        }
        ctx.player.sendMessage("Noob, practice more");
        ctx.reopen();
    },
};
//Register command to open form
pcommand.registerCommand(
    new Command("formtest", "Form test", false, (player) => {
        formManager.open(player, testForm, {}, 10);
    })
);
```

---

### Data Storage

For data storage, SAPI-Pro provides three classes: `DPDataBase`, `ScoreBoardJSONDataBase`, and `ScoreBoardDataBase`. These classes encapsulate the vanilla data storage, making it more convenient and efficient, and support large text segmentation storage. [Storing 10 novels]() is no problem.

#### Dynamic Storage Example

```typescript
import { Configdb } from "sapi-pro";
// Store numbers (can also store string, Vector3, boolean)
Configdb.set("test", 1);
// Store objects
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

### Multi-Package Communication

When multiple packages use SAPI-Pro, a main behavior pack is elected. Command registration is managed by the main pack, while command execution is handled by each pack individually to avoid conflicts.

The form system supports using` formManager.openExternal` to open forms registered by other behavior packs.

Scoreboard storage can be used to conveniently share data between multiple packages.

---

## Example Behavior Packs

[Auto Sorter](https://gitee.com/ykxyx666_admin/sorter-be)

[MCBE Music Player](https://gitee.com/ykxyx666_admin/music-player-mcbe)

[Simple Simulated Player](https://gitee.com/ykxyx666_admin/simple-sp)

## Reference Documentation

[SAPI-Pro Reference Documentation](./tutorial/README.md)

## Support and Contribution

Welcome all experts to contribute.

Issue reporting: <2408807389@qq.com>

GitHub Repository: [https://github.com/XiaoYangx666/SAPI-Pro](https://github.com/XiaoYangx666/SAPI-Pro)

Gitee Repository: [gitee.com/ykxyx666_admin/SAPI-Pro](gitee.com/ykxyx666_admin/SAPI-Pro)

> 🛠️ Recommended Development Environment:
>
> -   VSCode
> -   TypeScript 5.7+
> -   Node.js 20+
