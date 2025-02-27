# SAPI-Pro

![Requires](https://img.shields.io/badge/Requires-SAPI%201.18%20Beta-red) ![Support](https://img.shields.io/badge/Support-MCBE1.21.6x-green)

[简体中文](readme.md)|[English](readme_en.md)

> _This page is translated by deepseek_

## Core Features

-   **Command Parsing**: Supports multi-parameter and multi-branch command parsing with help display.
-   **Form Management**: Automatically manages form context and multi-layer form operations.
-   **Data Storage**: Dynamic data and scoreboard storage, supports large text segmentation.
-   **Multi-Behavior Pack Support**: Behavior packs using SAPI-Pro can call forms and commands from each other.

---

## Quick Start

### 📦 Installation Methods

#### Method 1: Base Template Creation (Recommended)

If you want to create a new script behavior pack based on SAPI-Pro, you can directly download the latest version of the base pack and start your new project from scratch.

1. [Download the latest base pack]()
2. Modify the behavior pack configuration.

```json
// manifest.json
"header": {
        "description": "SAPI-Pro Example Behavior Pack", // Change description
        "name": "SAPI-Pro Example Behavior Pack", // Change name
        "uuid": "9db8c694-0dc1-4263-a2c1-2cd8c2f29a9a", // Change UUID
        "version": [1, 0, 0],
        //...
},
"modules": [
        {
            //...
            "uuid": "aa930053-5c73-4e59-9c97-272c35e4eb80", // Change UUID
            //...
        }
    ],
```

3. Modify the library configuration.

```typescript
// src/SAPI-Pro/Config.ts
export const packInfo: PackInfo = {
    name: "SAPI-Pro Behavior Pack", // Behavior pack name
    version: 0.1, // Behavior pack version
    author: "XiaoYangx666", // Author
};
```

4. Write code.
   After completing the configuration, you can start writing code in `src/main.ts`, importing SAPI-Pro related classes via `import`. Compile to JS using tsc to run.

> **Tip**  
> If you are not using TypeScript, you can directly delete the src and tsconfig files. Modify the library configuration in `scripts/SAPI-Pro/Config.js` and write code directly in scripts/main.js.
> Do not delete the `import "./SAPI-Pro/main";` in main.ts, as the library needs to be initialized to function properly.

#### Method 2: Integrate into Existing Project

1. Choose version: [JavaScript Version]() | [TypeScript Version]()

2. Extract the library files to the project directory: (JS version is similar)

    ```bash
    📂 your_project/
    └── 📂 src/
        └── 📂 SAPI-Pro/
            ├── Command/
            ├── DataBase/
            └── main.ts
    ```

3. Initialize the library:
    ```typescript
    // Main entry file
    import "./SAPI-Pro/main";
    ```

---

## Core Module Details

### 🎮 Command System

You can register commands in two ways: by directly creating a Command object or using `Command.fromObject`. For more complex commands, it is recommended to create commands from objects.

Here are two simple command registration examples. You can get the parsed parameters via `param.name`. You can also create more complex commands with subcommands and multiple parameter branches. Please read [Command Registration]().

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
        const p = param.Player as Player;
        system.run(() => {
            p.kill(); // Read-only mode, requires system.run
        });
    },
    paramBranches: [
        // Parameters
        {
            name: "Player",
            type: "target",
        },
    ],
});
// Register
pcommand.registerCommand(ExampleCmd);
pcommand.registerCommand(killCmd);
```

#### Performance

Tested 10,000 command parsing takes 1100ms, averaging 9 commands/ms. 1 tick can parse 300+ commands, which is more than sufficient.

---

### 📋 Form Management

With SAPI-Pro, you can easily manage forms, whether creating forms or multi-level forms. Additionally, some commonly used forms like ButtonForm and ButtonListForm are built-in. See [Common Forms]() for details.

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
                player.sendMessage("666 Correct");
                return;
            }
        }
        player.sendMessage("Noob, practice more");
        return { type: NavType.REOPEN };
    },
});
// Register command to open form
pcommand.registerCommand(
    new Command("formtest", "Form Test", false, (player) => {
        FormManager.open(player, "test", {}, 10);
    })
);
```

The above is part of the code for a simple form that continuously prompts the user for input. It uses `FormManager.register` to register the form and `FormManager.open` to display the form to the user. For more usage, please refer to [Form Management]().

---

### 💾 Data Storage

For data storage, SAPI-Pro provides three classes: `DPDataBase`, `ScoreBoardJSONDataBase`, and `ScoreBoardDataBase`. These encapsulate the vanilla data storage, making it more convenient and faster, and support large text segmentation storage. [Storing 10 novels]() is no problem.

#### Dynamic Storage Example

```typescript
import { Configdb } from "SAPI-Pro/DataBase";
Configdb.set("test", 1); // Store value (can also store string, Vector3, boolean)
Configdb.setJSON("info", { author: "XiaoYangx666", version: 0.1 }); // Store object
const testValue = Configdb.get("test") as number;
const info = Configdb.getJSON("info") as any;
world.sendMessage(testValue.toString());
world.sendMessage(info.author);
```

> Output
> 1
> XiaoYangx666

---

## Example Behavior Packs

[Auto Organize]()
[MCBE Music Player]()
[Simple Dummy]()

## Reference Documentation

[SAPI-Pro Reference Documentation]()

## Support and Contribution

Welcome all experts to contribute.

Issue feedback: <2408807389@qq.com>  
 GitHub Repository: [github.com/SAPI-Pro]()
Gitee Repository: [gitee.com/ykxyx666_admin/SAPI-Pro](gitee.com/ykxyx666_admin/SAPI-Pro)

> 🛠️ Recommended Development Environment:
>
> -   VSCode
> -   TypeScript 4.7+
> -   Node.js 20+
