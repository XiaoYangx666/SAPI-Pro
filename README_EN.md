# SAPI-Pro

![Requires](https://img.shields.io/badge/Dependencies-SAPI%201.18%20Beta-red) ![Support](https://img.shields.io/badge/Supported%20Version-MCBE1.21.6x-green)

>Translated By DeepSeek

[简体中文](README.md)|[English](README_EN.md)

## Table of Contents
- [Installation](#installation)
    - [Create from Template](#method-1-create-from-basic-template-recommended)
    - [Integrate into Existing Project](#method-2-integrate-into-existing-project)
- [Core Modules Explained](#core-modules-explained)
    - [Command System](#command-system)
    - [Form Management](#form-management)
    - [Data Storage](#-data-storage)
- [Example Behavior Packs](#example-behavior-packs)
- [Reference Documentation](#reference-documentation)
- [Support and Contribution](#support-and-contribution)

---

## 📦 Installation

### Method 1: Create from Basic Template (Recommended)

If you want to create a new script behavior pack based on SAPI-Pro, you can directly download the latest version of the base pack and start your new project from scratch.

1. [Download the latest base pack](https://github.com/XiaoYangx666/SAPI-Pro/releases/latest)
2. Modify the behavior pack configuration (manifest.json)

```json
{
    "header": {
        "description": "SAPI-Pro Example Behavior Pack (Please modify the description)",
        "name": "SAPI-Pro Example Behavior Pack (Please modify the name)",
        "uuid": "9db8c694-0dc1-4263-a2c1-2cd8c2f29a9a (Change the UUID)",
        "version": [1, 0, 0]
    },
    "modules": [
        {
            "uuid": "aa930053-5c73-4e59-9c97-272c35e4eb80 (Change the UUID)"
        }
    ]
}
```

3. Modify the library configuration

```typescript
// src/SAPI-Pro/Config.ts
// or scripts/SAPI-Pro/Config.js
export const packInfo: PackInfo = {
    name: "SAPI-Pro Behavior Pack", // Behavior pack name
    version: 0.1, // Behavior pack version
    author: "XiaoYangx666", // Author
};
```

4. Install dependencies
   Execute `npm i` in the project directory to automatically install dependencies like @minecraft/server and @minecraft/server-ui.
5. Write code
   After completing the configuration, you can start writing code in `src/main.ts` and import SAPI-Pro related classes using `import`. Compile with tsc to generate js files for execution.

> **Tip**  
> If you are not using TypeScript, you can directly delete the src and tsconfig files and work in the `scripts/` directory.  
> Do not delete the `import "./SAPI-Pro/main"` statement, as the library needs to be initialized to function properly.

### Method 2: Integrate into Existing Project

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
    // Main entry file
    import "./SAPI-Pro/main";
    ```

---

## Core Modules Explained

### Command System

To create commands, you can use the Command constructor or `Command.fromObject`. The latter is recommended for more complex commands.

Here are two simple command registration examples. You can also create more complex commands. Please read [Command Registration](./tutorial/command.md).

#### Command Example

```typescript
import { Player, system } from "@minecraft/server";
import { Command, pcommand } from "SAPI-Pro/Command/main";

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
```

#### Performance

Tested 10000 command parsing takes 1100ms, averaging 9 commands/ms. 1 tick can parse 300+ commands, which is more than enough.

---

### Form Management

With SAPI-Pro, you can easily create forms and manage multi-level forms.

Here is a simple example of a form that continuously prompts the user for input. For more usage, please refer to [Form System](./tutorial/form.md#表单系统).
#### Form Example

```typescript
// Register form
FormManager.register({
    id: "test",
    builder: (player, ctx) => {
        const form = new ModalFormData().title("Test Form").textField("1+1=?", "114514");
        ctx.ans = 2;
        return form;
    },
    handler: (player, res: ModalFormResponse, ctx) => {
        if (res.formValues) {
            if (parseInt(res.formValues[0] as string) == ctx.ans) {
                player.sendMessage("666 Correct answer");
                return;
            }
        }
        player.sendMessage("Noob, practice more");
        return { type: NavType.REOPEN };
    },
});
// Register command to open the form
pcommand.registerCommand(
    new Command("formtest", "Form Test", false, (player) => {
        FormManager.open(player, "test", {}, 10);
    })
);
```

---

### 💾 Data Storage

For data storage, SAPI-Pro provides three classes: `DPDataBase`, `ScoreBoardJSONDataBase`, and `ScoreBoardDataBase`. These classes encapsulate the vanilla data storage, making it more convenient and efficient, and support large text segmentation storage. [Storing 10 novels]() is no problem.

#### Dynamic Storage Example

```typescript
import { Configdb } from "SAPI-Pro/DataBase";
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

## Example Behavior Packs

[Sorter](https://github.com/XiaoYangx666/SAPI-Pro_examples)

[MCBE Music Player](https://gitee.com/ykxyx666_admin/music-player-mcbe)

[Simple SP](https://github.com/XiaoYangx666/SAPI-Pro_examples)

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
> -   TypeScript 4.7+
> -   Node.js 20+