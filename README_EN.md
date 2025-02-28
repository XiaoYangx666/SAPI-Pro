# SAPI-Pro

![Requires](https://img.shields.io/badge/Requires-SAPI%201.18%20Beta-red) ![Support](https://img.shields.io/badge/Support%20Version-MCBE1.21.6x-green)

[简体中文](README.md)|[English](README_EN.md)

> Translated By DeepSeek-R1

## Core Features

-   **Command Parsing**: Supports multi-parameter, multi-branch command parsing and help display
-   **Form Management**: Automatic form context management and multi-layer form operations
-   **Data Storage**: Dynamic data and scoreboard storage with large text segmentation support
-   **Multi-Behavior Pack Support**: Behavior packs using SAPI-Pro can mutually call forms and commands

---

## Quick Start

### 📦 Installation

#### Method 1: Base Template Creation (Recommended)

If you want to create a new script behavior pack based on SAPI-Pro, download the latest base template:

1. [Download Latest Base Pack]()
2. Modify behavior pack configuration (manifest.json):

```json
{
    "header": {
        "description": "SAPI-Pro Example Behavior Pack (Modify Description)",
        "name": "SAPI-Pro Example Behavior Pack (Modify Name)",
        "uuid": "9db8c694-0dc1-4263-a2c1-2cd8c2f29a9a (Modify UUID)",
        "version": [1, 0, 0]
    },
    "modules": [
        {
            "uuid": "aa930053-5c73-4e59-9c97-272c35e4eb80 (Modify UUID)"
        }
    ]
}
```

3. Modify library configuration:

```typescript
// src/SAPI-Pro/Config.ts
export const packInfo: PackInfo = {
    name: "SAPI-Pro Behavior Pack", // Pack name
    version: 0.1, // Pack version
    author: "XiaoYangx666", // Author
};
```

4. Install dependencies:
   Run `npm i` in the project directory to install @minecraft/server and @minecraft/server-ui.
5. Start coding:
   Write your code in `src/main.ts` and import SAPI-Pro classes. Compile with tsc to run.

> **Note**  
> For JavaScript users: Delete TypeScript files and modify `scripts/SAPI-Pro/Config.js`. Keep `import "./SAPI-Pro/main"`.

#### Method 2: Integrate into Existing Project

1. Choose version: [JavaScript Version]() | [TypeScript Version]()
2. Extract library files to your project:

    ```bash
    📂 your_project/
    └── 📂 src/
        └── 📂 SAPI-Pro/
            ├── Command/
            ├── Form/
            ├── DataBase.ts
            └── main.ts
    ```

3. Initialize library:
    ```typescript
    // Main entry file
    import "./SAPI-Pro/main";
    ```

---

## Core Modules

### 🎮 Command System

Register commands via `Command` objects or `Command.fromObject`:

#### Example Commands

```typescript
import { Player, system } from "@minecraft/server";
import { Command, pcommand } from "SAPI-Pro/Command/main";

const ExampleCmd = new Command("test", "Command test", false, (player, param) => {
    player.sendMessage("SAPI-Pro activated!");
});
const killCmd = Command.fromObject({
    name: "kill",
    explain: "Self-destruct",
    handler(player, param) {
        system.run(() => {
            player.kill(); // Requires system.run in read-only mode
        });
    },
});
pcommand.registerCommand(ExampleCmd);
pcommand.registerCommand(killCmd);
```

#### Performance

Tested: 10,000 commands parsed in 1100ms (9/ms). Over 300 commands/tick supported.

---

### 📋 Form Management

Easily manage multi-layer forms with built-in templates:

#### Form Example

```typescript
FormManager.register({
    id: "test",
    builder: (player, ctx) => {
        const form = new ModalFormData().title("Test Form").textField("1+1=?", "114514");
        ctx.ans = 2;
        return form;
    },
    handler: (player, res: ModalFormResponse, ctx) => {
        if (res.formValues?.[0] === ctx.ans.toString()) {
            player.sendMessage("Correct!");
            return;
        }
        player.sendMessage("Try again");
        return { type: NavType.REOPEN };
    },
});

pcommand.registerCommand(
    new Command("formtest", "Form test", false, (player) => {
        FormManager.open(player, "test", {}, 10);
    })
);
```

---

### 💾 Data Storage

Three storage classes: `DPDataBase`, `ScoreBoardJSONDataBase`, and `ScoreBoardDataBase`:

#### Storage Example

```typescript
import { Configdb } from "SAPI-Pro/DataBase";
Configdb.set("test", 1); // Store numbers/strings/booleans
Configdb.setJSON("info", { author: "XiaoYangx666", version: 0.1 }); // Store objects
const testValue = Configdb.get("test") as number;
const info = Configdb.getJSON("info") as any;
world.sendMessage(testValue.toString()); // Output: 1
world.sendMessage(info.author); // Output: XiaoYangx666
```

---

## Example Packs

[Auto Sorter]()  
[MCBE Music Player]()  
[Simple Bot]()

## Documentation

[SAPI-Pro Documentation](./tutorial/README.md)

## Support & Contribution

Issues: <2408807389@qq.com>  
GitHub: [https://github.com/XiaoYangx666/SAPI-Pro](https://github.com/XiaoYangx666/SAPI-Pro)  
Gitee: [gitee.com/ykxyx666_admin/SAPI-Pro](gitee.com/ykxyx666_admin/SAPI-Pro)

> 🛠️ Recommended Environment:
>
> -   VSCode
> -   TypeScript 4.7+
> -   Node.js 20+
