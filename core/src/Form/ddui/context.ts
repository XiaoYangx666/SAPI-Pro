import type { Player } from "@minecraft/server";
import {
    CustomForm,
    ObservableBoolean,
    ObservableNumber,
    ObservableString,
    type ButtonOptions,
    type DividerOptions,
    type DropdownItemData,
    type DropdownOptions,
    type ImageOptions,
    type SliderOptions,
    type SpacingOptions,
    type TextFieldOptions,
    type TextOptions,
    type ToggleOptions,
    type UIRawMessage,
} from "@minecraft/server-ui";
import type { SAPIProFormContext } from "../form";
import type { contextArgs, FormLike } from "../interface";
import { computedObservable, type ObservableOf, type ObservableValue } from "./observable";
import type { DDScope, ObservableLike, SubscribableSource } from "./scope";
import type { DDUIPage, DDUISession } from "./page";

/** 表单文本：原生支持字符串 / ObservableString / 原始消息 */
export type DDText = string | ObservableString | UIRawMessage;

/** 可托管的外部资源：只需要 retain/release 两个方法（例如共享 ViewModel） */
export interface Retainable {
    retain(): void;
    release(): void;
}

/**
 * 单个 DDUI 页面的开发接口。
 *
 * 页面内的 Observable 订阅、派生状态、定时器、外部信号都由页面作用域托管，
 * 关闭/返回/替换时自动释放；业务代码只需要描述“状态是什么、变化时做什么”。
 */
export class DDUIContext<TArgs extends contextArgs = contextArgs> {
    /** 页面作用域，特殊资源可以显式托管 */
    readonly scope: DDScope;
    /** 原生 CustomForm，需要原生方法时直接使用；页面释放后为 undefined */
    form?: CustomForm;
    /** 打开本页时的参数（返回时原样保留；页面释放后清空引用） */
    readonly args: TArgs;
    private formContext?: SAPIProFormContext<CustomForm, TArgs>;
    private owner: Player;
    /** 本页创建的 Observable，释放时清空其中的文本，避免被原生表单继续留住 */
    private readonly created: Array<ObservableLike<any>> = [];

    constructor(
        private readonly session: DDUISession,
        formContext: SAPIProFormContext<CustomForm, TArgs>,
        form: CustomForm,
        args: TArgs
    ) {
        this.form = form;
        this.args = args;
        this.scope = session.scope;
        this.formContext = formContext;
        this.owner = formContext.player;
    }

    get player(): Player {
        return this.owner;
    }

    /** 页面是否已经关闭（异步回调里可以用来提前退出） */
    get closed(): boolean {
        return this.scope.isClosed;
    }

    /** @internal 断开对原生表单与页面参数的引用，避免跨堆引用把页面留住 */
    release() {
        // 先清空页面文本：即使引擎短暂保留已关闭的表单，也不会拖着一串行/标签字符串
        for (const observable of this.created) {
            try {
                if (typeof observable.getData() === "string") observable.setData("");
            } catch {
                // 表单已关闭，忽略
            }
        }
        this.created.length = 0;
        this.form = undefined;
        (this as { args?: TArgs }).args = undefined;
        this.formContext = undefined;
        (this as unknown as { session?: DDUISession }).session = undefined;
        // 未结算的 show() 可能仍持有本上下文；断开玩家 wrapper，避免 Players/Entity 句柄滞留。
        (this as unknown as { owner?: Player }).owner = undefined;
    }

    // ───────────────────────── 状态 ─────────────────────────

    /** 创建一个可被玩家编辑的数字 Observable（默认 clientWritable） */
    number(initial: number, options?: { clientWritable?: boolean }): ObservableNumber {
        const observable = new ObservableNumber(initial, { clientWritable: options?.clientWritable ?? true });
        this.created.push(observable);
        return observable;
    }

    /** 创建一个可被玩家编辑的文本 Observable（默认 clientWritable） */
    string(initial: string, options?: { clientWritable?: boolean }): ObservableString {
        const observable = new ObservableString(initial, { clientWritable: options?.clientWritable ?? true });
        this.created.push(observable);
        return observable;
    }

    /** 创建一个可被玩家编辑的开关 Observable（默认 clientWritable） */
    boolean(initial: boolean, options?: { clientWritable?: boolean }): ObservableBoolean {
        const observable = new ObservableBoolean(initial, { clientWritable: options?.clientWritable ?? true });
        this.created.push(observable);
        return observable;
    }

    /** 由若干 Observable 派生的只读 Observable，页面关闭后自动停止计算 */
    computed<T extends ObservableValue>(
        deps: readonly ObservableLike<any>[],
        compute: () => T
    ): ObservableOf<T>;
    computed<T extends ObservableValue>(compute: () => T): ObservableOf<T>;
    computed<T extends ObservableValue>(
        depsOrCompute: readonly ObservableLike<any>[] | (() => T),
        maybeCompute?: () => T
    ): ObservableOf<T> {
        const deps = typeof depsOrCompute === "function" ? [] : depsOrCompute;
        const compute = typeof depsOrCompute === "function" ? depsOrCompute : maybeCompute!;
        const observable = computedObservable(this.scope, deps, compute);
        this.created.push(observable);
        return observable;
    }

    /**
     * 监听变化（客户端输入，或业务代码直接 setData）。
     *
     * 通过 `ui.set()` 做的程序写入不会触发；值没变也不会触发。
     */
    onChange<T>(observable: ObservableLike<T>, callback: (value: T) => void): void {
        this.scope.track(
            observable,
            (value) => {
                if (this.session?.writeGuard.isOwnWrite(observable)) return;
                callback(value);
            },
            "onChange"
        );
    }

    /** 监听依赖变化（默认立即执行一次），用于“状态同步到别处”的副作用 */
    watch(deps: readonly ObservableLike<any>[], callback: () => void, immediate = true): void {
        if (immediate && !this.closed) callback();
        for (const dep of deps) this.scope.track(dep, () => callback(), "watch");
    }

    /**
     * 程序写入：不触发本页通过 ui.onChange 注册的回调；值没变时不写回、不通知。
     * 用于同步服务器状态、纠正越界值、格式化显示文本。
     */
    set<T>(observable: ObservableLike<T>, value: T): void {
        this.session?.writeGuard.write(observable, value);
    }

    /** 读取 Observable 当前值（语法糖） */
    get<T>(observable: ObservableLike<T>): T {
        return observable.getData();
    }

    /**
     * 托管外部订阅：原生 Observable（用 unsubscribe 退订）或事件信号（用返回的退订函数）。
     * 页面关闭时一定会解除订阅，回调也不会再执行。
     */
    subscribe<T>(source: SubscribableSource<T>, listener: (value: T) => void): void {
        this.scope.subscribe(source, listener);
    }

    /** 托管清理函数（关闭时执行，重复关闭只执行一次） */
    own(cleanup: () => void, label?: string): () => void {
        return this.scope.own(cleanup, label);
    }

    /** 托管定时任务（页面关闭自动取消，关闭后不会执行） */
    timeout(callback: () => void, ticks = 1): () => void {
        return this.scope.timeout(callback, ticks);
    }

    /** 托管循环任务（页面关闭自动取消） */
    interval(callback: () => void, ticks = 1): () => void {
        return this.scope.interval(callback, ticks);
    }

    /** 页面关闭时执行一次（等价于 own，语义更直观） */
    onClose(callback: () => void): void {
        this.scope.own(callback, "onClose");
    }

    /** 页面持有共享资源（ViewModel 等）的引用，关闭时自动 release */
    retain<T extends Retainable>(resource: T): T {
        resource.retain();
        this.scope.own(() => resource.release(), "retain");
        return resource;
    }

    // ───────────────────────── 原生控件 ─────────────────────────
    //
    // 所有控件方法都返回 `ui` 本身，链式调用不会绕过按钮保护。
    // 需要原生 `CustomForm` 时用 `ui.form`。

    label(text: DDText, options?: TextOptions): this {
        this.form?.label(text, options);
        return this;
    }

    header(text: DDText, options?: TextOptions): this {
        this.form?.header(text, options);
        return this;
    }

    toggle(label: DDText, value: ObservableBoolean, options?: ToggleOptions): this {
        this.form?.toggle(label, value, options);
        return this;
    }

    slider(
        label: DDText,
        value: ObservableNumber,
        min: number | ObservableNumber,
        max: number | ObservableNumber,
        options?: SliderOptions
    ): this {
        this.form?.slider(label, value, min, max, options);
        return this;
    }

    dropdown(
        label: DDText,
        value: ObservableNumber,
        items: DropdownItemData[],
        options?: DropdownOptions
    ): this {
        this.form?.dropdown(label, value, items, options);
        return this;
    }

    textField(label: DDText, text: ObservableString, options?: TextFieldOptions): this {
        this.form?.textField(label, text, options);
        return this;
    }

    image(src: ObservableString | string, pack: string, options?: ImageOptions): this {
        this.form?.image(src, pack, options);
        return this;
    }

    divider(options?: DividerOptions): this {
        this.form?.divider(options);
        return this;
    }

    spacer(options?: SpacingOptions): this {
        this.form?.spacer(options);
        return this;
    }

    closeButton(): this {
        this.form?.closeButton();
        return this;
    }

    /**
     * 按钮：回调带页面失效保护，关闭后迟到的点击、快速连点都不会重复执行/重复导航。
     */
    button(label: DDText, onClick: () => void, options?: ButtonOptions): this {
        // 回调放进可清空的盒子里：原生 CustomForm 可能被尚未结算的 show() 留住，
        // 直接闭包捕获 onClick 会让整页参数/钢琴运行时随表单一起滞留。
        const holder: { callback?: () => void } = { callback: onClick };
        this.scope.own(() => { holder.callback = undefined; }, "button");
        this.form?.button(label, () => {
            const callback = holder.callback;
            if (callback) this.session?.invoke(callback);
        }, options);
        return this;
    }

    // ───────────────────────── 导航 ─────────────────────────

    /** 页面释放后所有导航都变成无操作 */
    private navigate(
        mutate: (formContext: SAPIProFormContext<CustomForm, TArgs>, settleTicks: number) => void
    ): void {
        const session = this.session;
        const formContext = this.formContext;
        if (!session || !formContext) return;
        session.navigate(() => mutate(formContext, session.settleTicks));
    }

    /** 打开新页面（入栈）；传统表单同样可以入栈 */
    push<T extends contextArgs>(form: FormLike<T>, args?: T, delay?: number): void {
        this.navigate((ctx, settle) => ctx.push(form, args, delay ?? settle));
    }

    /** 返回上一页（没有上一页时关闭界面） */
    back(delay?: number): void {
        this.navigate((ctx, settle) => ctx.back(delay ?? settle));
    }

    /** 替换当前页（栈深度不变） */
    replace<T extends contextArgs>(form: FormLike<T>, args?: T, delay?: number): void {
        this.navigate((ctx, settle) => ctx.replace(form, args, delay ?? settle));
    }

    /** 用当前参数重新打开当前页（重建页面状态） */
    reopen(delay?: number): void {
        this.navigate((ctx, settle) => ctx.reopen(delay ?? settle));
    }

    /** 清空栈并打开新页 */
    reset<T extends contextArgs>(form: FormLike<T>, args?: T, delay?: number): void {
        this.navigate((ctx, settle) => ctx.offAll(form, args, delay ?? settle));
    }

    /** 关闭界面并清空栈 */
    close(): void {
        this.navigate((ctx) => ctx.close());
    }
}

export type { DDUIPage };
