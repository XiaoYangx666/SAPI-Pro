```ts
import { Player, ScoreboardIdentity } from "@minecraft/server";
import {
    ButtonForm,
    CommonForm,
    DataBase,
    DBTypes,
    DPDataBase,
    DropDownField,
    NumberField,
    ScoreBoardDataBase,
    TextField,
    Validators,
} from "sapi-pro";
import { getAllPlayers } from "sapi-pro/func";

const typeMapping: Record<DBTypes, string> = {
    DP: "§e",
    cSB: "§b",
    jSB: "§a",
};

export const DbListForm = new ButtonForm<{ dbs?: DataBase<any>[] }>({
    title: "数据库管理",
    generator(form, p, args) {
        args.dbs = DataBase.getDBs();
        form.body(
            [
                `数据库总数:${args.dbs.length}`,
                `动态数据库总字节数:${DPDataBase.getByteCount()}`,
            ].join("\n")
        );
    },
    buttonGenerator(player, args, t) {
        return args.dbs!.map((t) => ({
            label: `${typeMapping[t.type]}${t.type}-${t.name}`,
        }));
    },
    handler(ctx, btn) {
        ctx.push(DbInfoForm, { db: ctx.args.dbs![btn.btnIndex] });
    },
});

const DbInfoForm = new ButtonForm<
    {
        db: DataBase<any>;
        keys?: string[];
        participants?: ScoreboardIdentity[];
    },
    string
>({
    title: "数据库详情",
    generator(form, p, args) {
        const db = args.db;
        const keys = db.keys();
        args.keys = keys;
        const rows = [`数据库名称:${db.name}`, `类型:${db.type}`, `总键数:${keys.length}`];
        if (db instanceof ScoreBoardDataBase) {
            rows.push(`计分板名:${db.getScoreBoardName()}`);
            args.participants = db.participants();
        }
        form.body(rows.join("\n"));
    },
    buttons: [
        {
            label: "设置键值",
            func(ctx) {
                ctx.push(setValuePage, { db: ctx.args.db });
            },
        },
    ],
    buttonGenerator(player, args, t) {
        return args.keys!.map((k) => ({ label: k, data: k }));
    },
    oncancel(res, ctx) {
        ctx.back();
    },
    handler(ctx, btn) {
        const args = ctx.args;
        const key = args.keys![btn.btnIndex];
        const identity = args.participants?.[btn.btnIndex];
        ctx.push(DbValuePage, {
            db: args.db,
            key: identity ?? key,
        });
    },
});

const DbValuePage = new ButtonForm<{
    db: DataBase<any>;
    key: string | ScoreboardIdentity;
}>({
    title: "键值详情",
    buttons: [
        {
            label: "删除",
            func: (ctx) => {
                ctx.args.db.rm(ctx.args.key as any);
                ctx.back();
            },
        },
    ],
    validator(ctx) {
        const args = ctx.args;
        if (!(args.db instanceof ScoreBoardDataBase) && typeof args.key != "string") {
            return ctx.back();
        }
    },
    generator(form, player, args) {
        let value = args.db.get(args.key as any);
        value = JSON.stringify(value, undefined, 2);
        const key =
            args.key instanceof ScoreboardIdentity
                ? `${args.key.displayName}(${args.key.type})`
                : args.key;
        form.body(`键:${key}\n值:\n${value}`);
    },
    oncancel(res, ctx) {
        ctx.back();
    },
});

const setValuePage = CommonForm.InputForm<
    { key?: string; value?: string | number; player?: number },
    { db: DataBase<any>; players?: Player[] }
>({
    title: "设置值",
    fields: [
        new TextField("键", "输入键")
            .key("key")
            .optional()
            .validator(Validators.stringLength(1, 10)),
    ],
    fieldsGenerator(player, args) {
        if (args.db.type == "cSB") {
            args.players = getAllPlayers();
            return [
                new DropDownField(
                    "选择玩家",
                    args.players.map((t) => t.name)
                )
                    .key("player")
                    .validator((idx) => (args.players![idx].isValid ? undefined : "玩家不存在"))
                    .optional(),
                new NumberField("值", "请输入值")
                    .key("value")
                    .validator(Validators.isInt())
                    .optional(),
            ];
        }
        return [new TextField("值", "请输入值").key("value").optional()];
    },
    validateForm(data) {
        if (data.player != undefined) {
            return undefined;
        }
        const validator = Validators.notEmpty("key不能为空");
        return validator(data.key);
    },
    onSubmit(data, ctx) {
        console.log(JSON.stringify(data));
        const db = ctx.args.db;

        if (data.key != undefined && data.key.length != 0) {
            if (data.value == undefined) {
                if (data.key == undefined) {
                    ctx.back;
                }
                db.rm(data.key);
            } else {
                db.set(data.key, data.value);
            }
            return ctx.back();
        }

        //处理player
        if (data.player != undefined && db instanceof ScoreBoardDataBase) {
            const player = ctx.args.players![data.player];
            if (!player?.isValid) return ctx.back();
            if (data.value != undefined) {
                db.set(player, data.value);
            } else {
                db.rm(player);
            }
        }

        ctx.back();
    },
    onCancel(res, ctx) {
        ctx.back();
    },
});
```
